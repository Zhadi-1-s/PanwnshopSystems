import { CommonModule,isPlatformBrowser } from '@angular/common';
import { Component, OnInit,Inject,PLATFORM_ID, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable,of,combineLatest,map, filter, tap, switchMap,startWith,shareReplay,take ,Subject, takeUntil} from 'rxjs';
import { Product } from '../../../shared/interfaces/product.interface';
import { ProductService } from '../../../shared/services/product.service';
import { RouterModule } from '@angular/router';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ProductDetailComponent } from '../../components/modals/product-detail/product-detail.component';
import { User } from '../../../shared/interfaces/user.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { LombardService } from '../../../shared/services/lombard.service';
import { TranslateModule } from '@ngx-translate/core';
import {NgxSliderModule,Options} from '@angular-slider/ngx-slider'

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterModule,TranslateModule,NgxSliderModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  animations:[
    trigger('filterAnimation', [
      state(
        'closed',
        style({
          height: '0',
          opacity: 0,
          padding: '0px',
          margin:'0px',
          overflow: 'hidden',
         
        })
      ),
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden'
        })
      ),
      transition('closed <=> open', animate('200ms ease'))
    ])
  ]
})
export class ProductsListComponent implements OnInit, OnDestroy {

  user:User;
  
  pawnshop:PawnshopProfile;
  products$ : Observable<Product[]>;
  filteredProducts$:Observable<Product[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  productBase$:Observable<Product[]>

  appliedFilters$ = new BehaviorSubject<string[]>([])
  showFavoritesOnly$ = new BehaviorSubject<boolean>(false);

  favoriteItems$:Observable<Product[]>;
  favitems:Product[];
  isBrowser = false;
  isLoading = true;

  typeFilter: 'all' | 'sale' | 'loan' = 'all';

  sliderMinOptions: Options = {
    floor: 0,
    ceil: 500000,
    showTicks: false,
    showTicksValues: false,
    hidePointerLabels:true,
    hideLimitLabels:true
  };

  sliderMaxOptions: Options = {
    floor: 0,
    ceil: 500000,
    showTicks:false,
    showTicksValues:false,
    hidePointerLabels:true,
    hideLimitLabels:true
  };

  toogleFilterBlock: boolean = false;

  private destroy$ = new Subject<void>();

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
  selectedHelpItems :string[] = [];

  priceFrom: number | null = null;
  priceTo: number | null = null;
  priceSort: 'asc' | 'desc' | '' = '';

  constructor(
    private productService :ProductService,
    private modalService: NgbModal,
    private authService:AuthService,
    private pawnShopService :LombardService,
    private userService:UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ){

  }
  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.priceTo = this.sliderMaxOptions.ceil;
    this.loadFavorites();
    this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.userService.getFavoriteItems(user._id)),
      takeUntil(this.destroy$),
    ).subscribe(favorites => {
      this.favitems = favorites;  // сразу массив
    });
    // 1. Базовые продукты с учетом пользователя
    this.products$ = combineLatest([
      this.productService.getProcutsList(),
      this.authService.currentUser$.pipe(startWith(null))
    ]).pipe(
      switchMap(([items, user]) => {
        this.user = user;
        console.log(items);
        if (!user?._id) return of(items.filter(p => p.status === 'active'));
        return this.pawnShopService.getLombardByUserId(user._id).pipe(
          map(pawnshop => {
            this.pawnshop = pawnshop;
            if (pawnshop?._id) {
              return items.filter(
                p => p.status === 'active' && (!p.ownerId || p.ownerId !== pawnshop._id)
              );
            }
            return items.filter(p => p.status === 'active');
          })
        );
      }),
      tap(() => this.isLoading = false)
    );
    
    // 2. Фильтр + поиск + сортировка
    this.filteredProducts$ = combineLatest([this.products$, this.searchTerm$, this.appliedFilters$,this.showFavoritesOnly$]).pipe(
      map(([products, search, appliedFilters,showFavoritesOnly]) => {
        let result = [...products];

        // Фильтр по цене
        const priceFromFilter = appliedFilters.find(f => f.startsWith('Цена от:'));
        const priceToFilter = appliedFilters.find(f => f.startsWith('Цена до:'));
        if (priceFromFilter) {
          const val = parseFloat(priceFromFilter.replace(/\D/g, ''));
          result = result.filter(p => p.price >= val);
        }
        if (priceToFilter) {
          const val = parseFloat(priceToFilter.replace(/\D/g, ''));
          result = result.filter(p => p.price <= val);
        }

        if (showFavoritesOnly) {
          const favIds = new Set(this.favitems?.map(f => f._id));
          result = result.filter(p => favIds.has(p._id));
        }

        if (this.typeFilter !== 'all') {
            result = result.filter(p => p.type === this.typeFilter);
        }

        // Фильтр по help-items
        appliedFilters.forEach(f => {
          if (this.searchHelpItemsList.includes(f)) {
            const term = f.toLowerCase();
            result = result.filter(p => p.title.toLowerCase().includes(term));
          }
        });

        // Поиск по тексту
        if (search.trim()) {
          const term = search.toLowerCase();
          result = result.filter(p => p.title.toLowerCase().includes(term));
        }

        // Сортировка
        if (this.priceSort === 'asc') result.sort((a, b) => a.price - b.price);
        if (this.priceSort === 'desc') result.sort((a, b) => b.price - a.price);

        return result;
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Добавление help-item в фильтр
  onHelpItemClick(item: string) {
    const current = this.appliedFilters$.value;
    if (!current.includes(item)) {
      this.appliedFilters$.next([...current, item]);
    }
  }

  // Удаление фильтра
  removeFilter(filter: string) {
    const current = this.appliedFilters$.value;
    this.appliedFilters$.next(current.filter(f => f !== filter));
  }

  // Кнопка "Применить" — обновляем appliedFilters$ с ценой и сортировкой
  updateAppliedFilters() {
    const filters: string[] = [];
    if (this.priceFrom != null) filters.push(`Цена от: ${this.priceFrom.toLocaleString()} ₸`);
    if (this.priceTo != null) filters.push(`Цена до: ${this.priceTo.toLocaleString()} ₸`);
    if (this.priceSort) filters.push(`Сортировка: ${this.priceSort === 'asc' ? 'По возрастанию' : 'По убыванию'}`);

    // Сохраняем существующие help-items
    const helpItems = this.appliedFilters$.value.filter(f => this.searchHelpItemsList.includes(f));
    this.appliedFilters$.next([...filters, ...helpItems]);
  }


  setTypeFilter(type: 'all' | 'sale' | 'loan') {
    this.typeFilter = type;
    // триггерим перерасчет фильтра
    this.appliedFilters$.next([...this.appliedFilters$.value]);
  }

  // Кнопка "Очистить"
  clearFilters() {
    this.priceFrom = null;
    this.priceTo = this.sliderMaxOptions.ceil;
    this.priceSort = '';
    this.searchTerm$.next('');
    // оставляем help-items или полностью очищаем?
    this.appliedFilters$.next([]);
  }

  // Обновление поиска
  onSearchChange(value: string) {
    this.searchTerm$.next(value);
  }

  openProductDetails(item:Product){
    const modalRef = this.modalService.open(ProductDetailComponent)
    console.log('OPEN DETAIL FOR PRODUCT:', item);
    modalRef.componentInstance.product = item;
    modalRef.componentInstance.user = this.user;
    modalRef.componentInstance.pawnshop = this.pawnshop;
  }

  loadFavorites(){
    this.favoriteItems$ = this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.userService.getFavoriteItems(user._id)),
      tap(favorites => this.favitems = favorites)
    )
  }

  isFavorite(productId: string, favorites: Product[]): boolean {
    return favorites?.some(f => f._id === productId) ?? false;
  }

  toggleFavorite(product: Product, event: MouseEvent) {
    console.log(product)
    event.stopPropagation();
    if (!this.user?._id) return;

    const isFav = this.favitems?.some(f => f._id === product._id);

    const req$ = isFav
      ? this.userService.removeFavoriteItem(this.user._id, product._id)
      : this.userService.addFavoriteItem(this.user._id, product._id);

    req$.subscribe({
      next: () => {
        if (isFav) {
          this.favitems = this.favitems.filter(f => f._id !== product._id);
        } else {
          this.favitems = [...(this.favitems || []), product];
        }
      },
      error: (err) => console.error('Ошибка при обновлении избранного:', err)
    });
  }

  toggleFavorites() {
    this.showFavoritesOnly$.next(!this.showFavoritesOnly$.value);
  }


}
