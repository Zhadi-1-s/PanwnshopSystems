import { Component, OnInit } from '@angular/core';
import { Observable,BehaviorSubject,combineLatest,map, switchMap,forkJoin,of,tap } from 'rxjs';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { LombardService } from '../../../shared/services/lombard.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../../shared/interfaces/product.interface';
import { ProductService } from '../../../shared/services/product.service';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/interfaces/user.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pawnshop-list',
  standalone: true,
  imports: [CommonModule,TranslateModule, ReactiveFormsModule,FormsModule,RouterModule],
  templateUrl: './pawnshop-list.component.html',
  styleUrl: './pawnshop-list.component.scss'
})
export class PawnshopListComponent implements OnInit{

  lombards$:Observable<PawnshopProfile[]>;
  filteredLombards$: Observable<PawnshopProfile[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  productsOfPawnShop$: Observable<Product[]>;

  activeFilter: 'all' | 'active' | 'empty' = 'all';
  sortByRating: 'none' | 'asc' | 'desc' = 'none';

  appliedFilters$ = new BehaviorSubject<string[]>([])

  user :User;

  favorites: any[] = [];

  searchHelpItemsList: string[] = [
    'Iphone',
    'Samsung',
    'Xiaomi',
    'Laptop',
    'Headphones',
    'Camera',
    'Watch',
    'Tablet'
  ]

  isTooltipOpen = false;
  sortOrder: 'asc' | 'desc' | null = 'desc';

  constructor(
    private lombardService:LombardService,
    private productService:ProductService,
    private userService:UserService,
    private authService:AuthService
  ){

  }

  ngOnInit(){

    this.authService.currentUser$.subscribe(
      (user) => {
        this.user = user;
      }
    )

    this.lombards$ = this.lombardService.getLombards().pipe(
      switchMap(lombards => {
        const requests = lombards.map(l =>
          this.productService.getProductsByOwner(l._id).pipe(
            map(products => ({ ...l, products })), 
          )
        );
        return requests.length ? forkJoin(requests) : of([]);
      })
    );

    this.loadFavorites();
    console.log(this.favorites)

    this.filteredLombards$ = combineLatest([
      this.lombards$,
      this.searchTerm$,
      this.appliedFilters$
    ]).pipe(
      map(([lombards, search, appliedFilters])=>{
        let filtered = lombards;

        if(search.trim()){
          filtered = filtered.filter(l =>
            l.name.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (appliedFilters.length > 0) {
          filtered = filtered.filter(lombard =>
            lombard.products?.some(product =>
              appliedFilters.some(f =>
                product.title.toLowerCase().includes(f.toLowerCase())
              )
            )
          );
        }
        if (this.sortOrder === 'asc') {
          filtered = filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        } else if (this.sortOrder === 'desc') {
          filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        return filtered;

      })
    )

    

  }

  loadFavorites(){
    if(this.user){
      this.userService.getFavorites(this.user._id).subscribe({
        next: (res) => (this.favorites = res),
        
        error: (err) => console.error(err),
      });
      console.log(this.favorites)
    }
  }

  toggleTooltip() {
    this.isTooltipOpen = !this.isTooltipOpen;
  }

  onSortChange(order: 'asc' | 'desc') {
    this.sortOrder = order;
    
     this.searchTerm$.next(this.searchTerm$.value); 
  }

  toggleFavorite(pawnshopId: string,event:MouseEvent): void {
    event.stopPropagation(); 
    if (!this.user) return;

    const isFavorite = this.user.favoritePawnshops?.includes(pawnshopId);

    const req$ = isFavorite
      ? this.userService.removeFavorite(this.user._id!, pawnshopId)
      : this.userService.addFavorite(this.user._id!, pawnshopId);

    req$.subscribe({
      next: (res) => {
        if (isFavorite) {
          this.user.favoritePawnshops = this.user.favoritePawnshops.filter(id => id !== pawnshopId);
        } else {
          this.user.favoritePawnshops = [...(this.user.favoritePawnshops || []), pawnshopId];
        }
      },
      error: (err) => console.error('Ошибка при обновлении избранного:', err)
    });
  }


  onHelpItemClick(item: string) {
    
   const current = this.appliedFilters$.value;
    if (!current.includes(item)) {
      this.appliedFilters$.next([...current, item]);
    }
  }

  removeFilter(filter: string) {
    const current = this.appliedFilters$.value;
    this.appliedFilters$.next(current.filter(f => f !== filter));
    this.searchTerm$.next(this.searchTerm$.value);
  }

   onSearchChange(value: string) {
    this.searchTerm$.next(value);
  }

  toFavorite(userId: string, pawnshopId: string,): void {
    this.userService.addFavorite(userId, pawnshopId).subscribe({
      next: (res) => {
        console.log('Добавлено в избранное:', res);
      },
      error: (err) => {
        console.error('Ошибка при добавлении в избранное:', err);
      }
    });
  }

}
