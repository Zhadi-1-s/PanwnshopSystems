import { Component, OnInit } from '@angular/core';
import { LombardService } from '../../../shared/services/lombard.service';
import { Observable, switchMap, tap,map,of,take } from 'rxjs';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../shared/interfaces/product.interface';
import { ProductService } from '../../../shared/services/product.service';
import { trigger,transition,style,animate } from '@angular/animations';

import { NgbModal, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductDetailComponent } from '../../components/modals/product-detail/product-detail.component';
import { User } from '../../../shared/interfaces/user.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { Review } from '../../../shared/interfaces/reviews.interface';
import { FormsModule } from '@angular/forms';
import { TermModalComponent } from '../../components/modals/term-modal/term-modal.component';
import { LoginRequiredComponent } from '../../components/modals/login-required/login-required.component';
import { EvalutaionComponent } from '../../components/modals/evalutaion/evalutaion.component';

@Component({
  selector: 'app-pawnshop-detail',
  standalone: true,
  imports: [CommonModule,TranslateModule,FormsModule],
  templateUrl: './pawnshop-detail.component.html',
  styleUrl: './pawnshop-detail.component.scss'
})
export class PawnshopDetailComponent implements OnInit{

  id:string;
  pawnShop:PawnshopProfile;
  product:Product;

  user:User;

  pawnShop$: Observable<PawnshopProfile>;
  products$: Observable<(Product & { open?: boolean })[]> = of([]);
  favoriteItems$: Observable<Product[]> = of([]);
  favoriteShops$:Observable<PawnshopProfile[]> = of([]);
  currentTime = new Date();
  isOpenNow = false;

  favoriteItems:any[] = [];

  newRating: number = 5;
  newComment: string = '';
  commentError = false;
  ratingError = false;
  roleError = false;
  reviews:string[];

  favorites:any[];

  constructor(
    private lombardService:LombardService,
    private route:ActivatedRoute,
    private productService:ProductService,
    private modalService: NgbModal,
    private authService:AuthService,
    private userService:UserService,
    private pawnshopService:LombardService,
    private router:Router
  ){

  }

  ngOnInit(): void {

    this.authService.currentUser$.subscribe(
      (user) => {
        this.user = user;
        this.authService.currentUser$.subscribe(user => {
        this.user = user;

        if (!user) return;

        this.userService.getAllFavorites(user._id).subscribe(res => {
          this.favoriteItems = res.items;
          this.favorites = res.shops;

          console.log('Товары:', res.items);
          console.log('Ломбарды:', res.shops);
        });
      });

      }
    )
    this.id = this.route.snapshot.paramMap.get('id')!;

    if(this.id){
      this.pawnShop$ = this.lombardService.getLombardById(this.id)
      
      this.pawnShop$.subscribe(profile => {
        this.pawnShop = profile;
      });

    }

    this.pawnShop$.subscribe(profile => {
      if (profile?.openTime && profile?.closeTime) {
        const now = new Date();
        const [openHour, openMinute] = profile.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = profile.closeTime.split(':').map(Number);

        const open = new Date();
        open.setHours(openHour, openMinute);

        const close = new Date();
        close.setHours(closeHour, closeMinute);

        this.isOpenNow = now >= open && now <= close;
      }
    });
   // продукты — только из store
    this.products$ = this.productService.getProducts();

    // когда загрузился ломбард → грузим продукты
    this.pawnShop$
      .pipe(take(1))
      .subscribe(profile => {
        this.productService.loadProductsByOwner(profile._id);
      });
  }

  showTerms = false;
  openTermsModal() {
    const modalRef = this.modalService.open(TermModalComponent, {
      centered: true,
      size: 'md'
    });
    console.log(this.pawnShop.terms)
    modalRef.componentInstance.terms = this.pawnShop.terms;
  }

  submitReview(pawnshopId: string) {
    this.ratingError = this.newRating === 0;
    this.commentError = !this.newComment.trim();

    this.roleError = this.user?.role === 'pawnshop';

    if (this.roleError || this.ratingError || this.commentError) {
      return;
    }

    this.addReview(pawnshopId);
  }

  addReview(pawnshopId: string) {
    if (!this.user || !pawnshopId) return;

    const review: Review = {
      userId: this.user._id!,
      userName: this.user.name,
      rating: this.newRating,
      comment: this.newComment,
      createdAt: new Date()
    };

    this.pawnshopService.addReview(pawnshopId, review).subscribe({
      next: updatedPawnshop => {
        this.pawnShop$ = of(updatedPawnshop); // обновляем view
        this.newRating = 5;
        this.newComment = '';
        console.log(updatedPawnshop, 'updated pawnshop');
      },
      error: err => {
        if (err.status === 400) {
          alert('Вы уже оставляли отзыв для этого ломбарда');
        } else {
          console.error(err);
        }
      }
    });
  }




  openProductDetail(product: Product){
    const modalRef = this.modalService.open(ProductDetailComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.product = product;
    modalRef.componentInstance.pawnshop = this.pawnShop;

  }

   loadFavoritItems(){
    if(this.user){
      this.userService.getFavoriteItems(this.user._id).subscribe({
        next: (res) => (this.favoriteItems = res),
        
        error: (err) => console.error(err),
      });
      console.log(this.favoriteItems)
    }
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


  toggleFavoriteItem(productId: string, event: MouseEvent): void {
    event.stopPropagation(); // чтобы не срабатывал click на карточке
    if (!this.user || !this.user._id) {
      this.openLoginRequiredModal();
      return;
    }

    const isFavorite = this.user.favoriteItems?.includes(productId);

    const req$ = isFavorite
      ? this.userService.removeFavoriteItem(this.user._id, productId)
      : this.userService.addFavoriteItem(this.user._id, productId);

    req$.subscribe({
      next: (res) => {;
        if (isFavorite) {
          this.user.favoriteItems = this.user.favoriteItems.filter(id => id !== productId);
        } else {
          this.user.favoriteItems = [...(this.user.favoriteItems || []), productId];
        }
      },
      error: (err) => console.error('Ошибка при обновлении избранного:', err),
    });
  }

  openLoginRequiredModal() {
    const modalRef = this.modalService.open(LoginRequiredComponent, {
      centered: true,
      size: 'sm'
    });

    modalRef.result.then((res) => {
      if (res === 'login') {
        this.router.navigate(['/auth/login']);
      }
    }, () => {});
  }

  openEvaluationModal(){

    if(!this.user){
      this.modalService.open(LoginRequiredComponent)
      return
    }
    
    const modalRef = this.modalService.open(EvalutaionComponent, {
      centered: true,
      size: 'md',
      scrollable:true
    });

    modalRef.componentInstance.pawnshopId = this.pawnShop._id;
    modalRef.componentInstance.userId = this.user?._id;
    modalRef.componentInstance.term = this.pawnShop.terms
    modalRef.closed.subscribe(() => {
      // Handle modal close if needed
      modalRef.close();
    });
  }

}
