import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/interfaces/user.interface';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EditModalComponent } from '../../components/modals/edit-modal/edit-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../../shared/services/product.service';
import { Observable,map,pipe ,filter, switchMap, tap,firstValueFrom,of, forkJoin,catchError} from 'rxjs';
import { Product } from '../../../shared/interfaces/product.interface';
import { CreateProductComponent } from '../../components/modals/create-product/create-product.component';
import { ProductDetailComponent } from '../../components/modals/product-detail/product-detail.component';
import { EditProductComponent } from '../../components/modals/edit-product/edit-product.component';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { UserService } from '../../../shared/services/user.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AppNotification } from '../../../shared/interfaces/notification.interface';
import { OfferService } from '../../../shared/services/offer.service';
import { Offer } from '../../../shared/interfaces/offer.interface';
import { OfferDetailComponent } from '../../components/modals/offer-detail/offer-detail.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'] 
})
export class ProfileComponent implements OnInit {
  user$:Observable<User>;
  loading = true;
  error: string | null = null;

  myProducts:string[];

  currentTime: Date = new Date();

  selectedTab: 'active' | 'inactive' = 'active';
  activeSection: 'offers' | 'system' | 'chats' | 'others' = 'offers';

  user:User;

  products$:Observable<Product[]>;
  activeProducts$!: Observable<Product[]>;
  inactiveProducts$!: Observable<Product[]>;
  favoritePawnshops$:Observable<PawnshopProfile[]>;
  favoriteProducts$:Observable<Product[]>;
  notifications$:Observable<AppNotification[]>;
  product$:Observable<Product>;

  notificationsList:AppNotification[];
  product:Product;
  
  productsById: Record<string, Product> = {};

  openedMenuIndex: number | null = null;

  sections = [
    { id: 'offers', label: 'Offers' },
    { id: 'system', label: 'System' },
    { id: 'chats', label: 'Chats', disabled: true },
    { id: 'others', label: 'Others' },
  ];

  constructor(
              private authService: AuthService, 
              private modalService: NgbModal,
              private productService:ProductService,
              private userService:UserService,
              private notificationService:NotificationService,
              private offerService:OfferService,
              private router: Router
  ) {

  }

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$.pipe(
      tap(user => {this.user = user,console.log(user,'current user')})
    );
  
    this.loading = true;

    this.notifications$ = this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.notificationService.getUserNotifications(user._id)),
      tap(notifications => {
        // Сохраняем все уведомления
        this.notificationsList = notifications;
        console.log(notifications, 'loaded notifications');
      }),
      switchMap(notifications => {
        // Фильтруем только уведомления напрямую на продукты
        const productNotifications = notifications.filter(n =>
          !['new-offer', 'offer-accepted', 'offer-rejected'].includes(n.type)
        );

        const productIds = productNotifications.map(n => n.refId).filter(Boolean);

        if (productIds.length === 0) return of([]);

        return forkJoin(
          productIds.map(id =>
            this.productService.getProductById(id).pipe(
              catchError(() => of(null)) // на случай 404
            )
          )
        );
      }),
      tap(products => {
        this.productsById = Object.fromEntries(products.filter(p => p).map(p => [p._id, p]));
        console.log(this.productsById, 'products from notification');
      })
    );
    
    this.product$ = this.notifications$.pipe(
      filter(n => n.length > 0),
      switchMap(notifications => this.productService.getProductById(notifications[0].refId)),
      tap(product => {
        this.product = product,
        console.log('product from notificaiotn',product)
      })
    )

    this.activeProducts$ = this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.productService.getProductsByOwner(user._id)),
      map((products) => products.filter((p => p.status === 'active')))
    )
    this.inactiveProducts$ = this.authService.currentUser$.pipe(
      filter((user):user is User => !!user?._id),
      switchMap(user => this.productService.getProductsByOwner(user._id)),
      map((products) => products.filter((p => p.status !== 'active')))
    )

    this.favoritePawnshops$ = this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.userService.getFavorites(user._id)),
      tap(pawnshop => console.log(pawnshop,'loaded farvoire pawnshops'))
    )
    this.favoriteProducts$ = this.authService.currentUser$.pipe(
      filter((user):user is User => !!user?._id),
      switchMap(user => this.userService.getFavoriteItems(user._id)),
      tap(products => console.log(products, 'loaded favorite products'))
    )
    this.loadOffers();
    
  }

 loadOffers() {
  this.authService.currentUser$.pipe(
    filter((user): user is User => !!user?._id),
    switchMap(user => this.notificationService.getUserNotifications(user._id)),
    tap(notifications => {
      this.notificationsList = notifications || [];
    }),
    switchMap(notifications => {
      const offerIds = notifications
        .filter(n => n.type === 'new-offer')
        .map(n => n.refId)
        .filter(id => !!id);

      if (offerIds.length === 0) return of({ offers: [], products: [] });

      // Получаем офферы
      return forkJoin(
        offerIds.map(id =>
          this.offerService.getOfferById(id).pipe(
            catchError(() => of(null))
          )
        )
      ).pipe(
        map(offers => ({ offers: offers.filter(o => o !== null), products: [] })) // пока продукты пустые
      );
    }),
    switchMap(({ offers }) => {
      if (!offers.length) return of({ offers: [], products: [] });

      // Получаем продукты офферов
      const productIds = offers.map(o => o.productId);
      return forkJoin(
        productIds.map(id =>
          this.productService.getProductById(id).pipe(
            catchError(() => of(null))
          )
        )
      ).pipe(
        map(products => ({ offers, products: products.filter(p => p) }))
      );
    }),
    tap(({ offers, products }) => {
      this.productsById = Object.fromEntries(products.map(p => [p._id, p]));

      const offerNotifications = offers.map(offer => ({
        _id: offer._id,
        userId:offer.productOwnerId,
        senderId:offer.pawnshopId,
        type: 'new-offer' as 'new-offer',
        title: 'Offer received',
        message: `Price: ${offer.price} ₸` + (offer.message ? ` — ${offer.message}` : ''),
        refId: offer.productId,
        isRead: false,
        createdAt: offer.createdAt || new Date(),
        data: offer
      }));

      this.notificationsList = [
        ...(this.notificationsList || []),
        ...offerNotifications
      ];

      console.log('Notifications list with offers', this.notificationsList);
      console.log('Products from offers', this.productsById);
    })
  ).subscribe();
}



  deleteProduct(itemId:string){

  }

  editProduct(item:Product){
    const modalRef = this.modalService.open(EditProductComponent);

    modalRef.componentInstance.product = item;
  }

  async openEditModal() {
    const user = await firstValueFrom(this.authService.currentUser$);

    if (!user) return;

    const modalRef = this.modalService.open(EditModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;

  }

  async openCreateItemModal(){
    const user = await firstValueFrom(this.authService.currentUser$);
    const modalRef = this.modalService.open(CreateProductComponent);

    modalRef.componentInstance.ownerId = user._id;
  }

  async openProductDetails(item:Product){
    const user = await firstValueFrom(this.authService.currentUser$);
    const modalRef = this.modalService.open(ProductDetailComponent);

    modalRef.componentInstance.product = item;
    modalRef.componentInstance.user = user;
   
  }

  async openOfferDetailModal(offer:Offer){
    const user = await firstValueFrom(this.authService.currentUser$)
    const modalRef = this.modalService.open(OfferDetailComponent);

    modalRef.componentInstance.offer = offer;
    modalRef.componentInstance.user = user;

    
  }

  openPawnshopDetail(id:string){
    this.router.navigate(['/pawnshop-detail',id])
  }

  markAsRead(notification: AppNotification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id!).subscribe(() => {
        notification.isRead = true;
      });
    }
  }
  get offerNotifications() {
    return (this.notificationsList || []).filter(n =>
      ['new-offer','offer-accepted','offer-rejected'].includes(n.type)
    );
  }

  get systemNotifications() {
    return (this.notificationsList || []).filter(n => n.type === 'system');
  }

  get chatNotifications() {
    return (this.notificationsList || []).filter(n => n.type === 'chat-opened');
  }

  get otherNotifications() {
    return (this.notificationsList || []).filter(n =>
      ['product-sold','price-changed','chat-opened'].includes(n.type)
    );
  }

  get unreadOtherNotifications() {
    return (this.notificationsList || []).filter(
      n => ['product-sold','price-changed','chat-opened'].includes(n.type) && !n.isRead
    );
  }

  get unreadOfferNotifications() {
    return (this.notificationsList || []).filter(n =>
      ['new-offer','offer-accepted','offer-rejected'].includes(n.type) && !n.isRead
    );
  }

  removeFromFavorites(productId:string){
    if(this.user){
      const currentUser = this.user;
      this.userService.removeFavoriteItem(currentUser._id,productId).subscribe({
        next:() => {
          this.favoriteProducts$ = this.favoriteProducts$.pipe(
            map(products => products.filter(p => p._id !== productId ))
          );
        },
        error : err => console.error(err)
      })
    }
  }

}
