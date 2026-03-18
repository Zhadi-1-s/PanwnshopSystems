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
import { Observable,map,pipe ,filter, switchMap, tap,firstValueFrom,of, forkJoin,catchError, take} from 'rxjs';
import { Product } from '../../../shared/interfaces/product.interface';
import { CreateProductComponent } from '../../components/modals/create-product/create-product.component';
import { ProductDetailComponent } from '../../components/modals/product-detail/product-detail.component';
import { EditProductComponent } from '../../components/modals/edit-product/edit-product.component';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { UserService } from '../../../shared/services/user.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AppNotification } from '../../../shared/interfaces/notification.interface';
import { OfferService } from '../../../shared/services/offer.service';
import { Evaluation, Offer } from '../../../shared/interfaces/offer.interface';
import { OfferDetailComponent } from '../../components/modals/offer-detail/offer-detail.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Slot } from '../../../shared/interfaces/slot.interface';
import { SlotService } from '../../../shared/services/slot.service';
import { SlotExtendComponent } from '../../components/modals/slot-extend/slot-extend.component';
import { LombardService } from '../../../shared/services/lombard.service';
import { EvaluationDetailComponent } from '../../components/modals/evaluation-detail/evaluation-detail.component';
import { EvaluationService } from '../../../shared/services/evaluation.service';
import { FormsModule } from '@angular/forms';

interface SlotView extends Slot {
  prolongationAllowed: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgbTooltipModule,FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'] 
})
export class ProfileComponent implements OnInit {
  user$:Observable<User>;
  loading = true;
  error: string | null = null;

  offersById: Record<string, Offer> = {};

  evaluationsById: Record<string, Evaluation> = {};

  myProducts:string[];

  currentTime: Date = new Date();

  selectedTab: 'active' | 'inactive' = 'active';
  activeSection: 'offers' | 'system' | 'chats' | 'others' | 'loans'= 'offers';

  user:User;

  hasActiveLoan:false;

  products$:Observable<Product[]>;
  activeProducts$!: Observable<Product[]>;
  inactiveProducts$!: Observable<Product[]>;
  favoritePawnshops$:Observable<PawnshopProfile[]>;
  favoriteProducts$:Observable<Product[]>;
  notifications$:Observable<AppNotification[]>;
  product$:Observable<Product>;

  slots$:Observable<SlotView[]>;

  notificationsList:AppNotification[];
  product:Product;
  
  productsById: Record<string, Product> = {};

  pawnshopFromSlot:PawnshopProfile;

  openedMenuIndex: number | null = null;

  offerSection: 'received' | 'sent' = 'received';

  pawnshopIdFromOffer:string;

  statusFilter = {
    pending: false,
    in_inspection: false,
    completed: false,
    rejected: false,
    no_show: false,
    in_loan: false,
    rejected_by_pawnshop: false
  };
  sortByDate: 'newest' | 'oldest' = 'newest';

  offerFilter: 'all' | 'active' | 'completed' = 'all';
  isOfferFilterOpen = false;

  sections = [
    { id: 'offers', label: 'Offers' },
    { id: 'system', label: 'System' },
    { id: 'loans', label: 'Loans' },
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
              private router: Router,
              private slotService:SlotService,
              private pawnshopService:LombardService,
              private evaluationService:EvaluationService
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
        // console.log(notifications, 'loaded notifications');
      }),
      switchMap(notifications => {
        // Фильтруем только уведомления напрямую на продукты
        const productNotifications = notifications.filter(n =>
          !['new-offer', 'offer-accepted', 'offer-rejected','offer-cancelled','evaluation-updated','evaluation-accepted','evaluation-created'].includes(n.type)
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

    this.slots$ = this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.slotService.getSlotsByUserId(user._id)),
      switchMap((slots: Slot[]) => {
        if (!slots.length) return of([] as SlotView[]);

        return forkJoin(
          slots.map(slot => {
            const pawnshopId = typeof slot.pawnshopId === 'string'
              ? slot.pawnshopId
              : slot.pawnshopId._id?.toString(); // <-- безопасно извлекаем ID

            return this.pawnshopService.getLombardById(pawnshopId).pipe(
              map(lombard => ({
                ...slot,
                prolongationAllowed: !!lombard?.terms?.prolongationAllowed
              }))
            );
          })
        );
      })
    );

    this.favoriteProducts$ = this.authService.currentUser$.pipe(
      filter((user):user is User => !!user?._id),
      switchMap(user => this.userService.getFavoriteItems(user._id)),
      tap(products => console.log(products, 'loaded favorite products'))
    )
    this.loadOffers();
    this.loadEvaluations();
    
  }

  loadOffers() {
    this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      take(1),
      switchMap(user => this.notificationService.getUserNotifications(user._id)),
      map(notifications =>
        notifications.filter(n => n.type === 'new-offer' && !!n.refId)
      ),
      switchMap(offerNotifications => {
        if (!offerNotifications.length) return of([]);

        return forkJoin(
          offerNotifications.map(n =>
            this.offerService.getOfferById(n.refId!).pipe(
              catchError(() => of(null))
            )
          )
        );
      }),
      tap(offers => {
        this.offersById = Object.fromEntries(
          offers
            .filter((o): o is Offer => !!o && !!o._id)
            .map(o => [o._id!, o])
        );

        console.log('Offers by id loaded', this.offersById);
        console.log('pawnshopId',this.offersById[Object.keys(this.offersById)[0]]?.pawnshopId);
      })
    ).subscribe();
  }

  loadEvaluations() {
    this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      take(1),
      switchMap(user => this.notificationService.getUserNotifications(user._id)),
      map(notifications =>
        notifications.filter(n =>
          ['evaluation-created','evaluation-accepted','evaluation-rejected'].includes(n.type) && !!n.refId
        )
      ),
      switchMap(evaluationNotifications => {
        if (!evaluationNotifications.length) return of([]);

        return forkJoin(
          evaluationNotifications.map(n =>
            this.evaluationService.getEvaluationById(n.refId!).pipe(
              catchError(() => of(null))
            )
          )
        );
      }),
      tap(evaluations => {
        this.evaluationsById = Object.fromEntries(
          evaluations
            .filter((e): e is Evaluation => !!e && !!e._id)
            .map(e => [e._id!, e])
        );

        console.log('Evaluations by id loaded', this.evaluationsById);
      })
    ).subscribe();
  }

  deleteProduct(itemId:string){
    this.productService.deleteProduct(itemId).subscribe({
      next:() => console.log('Product deleted'),
      error: err => console.error('Error deleting product', err)
    });
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
    if(user.role === 'user'){
      modalRef.componentInstance.ownerType = 'user'
    }
    else{
      modalRef.componentInstance.ownerType = 'pawnshop'
    }
  }

  async openProductDetails(productId:string){
    const user = await firstValueFrom(this.authService.currentUser$);
    const modalRef = this.modalService.open(ProductDetailComponent);

    modalRef.componentInstance.user = user;
    modalRef.componentInstance.productId = productId;
   
    console.log('Opening product details modal with:', {
      product: productId,
      user: user
    });

  }

  openExtendSlotModal(slot: Slot) {
    this.pawnshopService.getLombardById(slot.pawnshopId)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          if (!data?.terms?.prolongationAllowed) return;

          const modalRef = this.modalService.open(
            SlotExtendComponent,
            { size: 'medium', centered: true }
          );

          modalRef.componentInstance.slot = slot;
          modalRef.componentInstance.user = this.user;
        },
        error: (err) => {
          console.error('Failed to load pawnshop', err);
        }
      });
  }

  async openOfferDetailModal(offer:Offer){
    const user = await firstValueFrom(this.authService.currentUser$)
    const modalRef = this.modalService.open(OfferDetailComponent);

    console.log(offer,'here we go')

    modalRef.componentInstance.offer = offer;
    modalRef.componentInstance.user = user;
    modalRef.componentInstance.pawnshopId = offer.pawnshopId;


  }

  onNotificationClick(n: AppNotification) {

    if (!n.isRead) {
      this.markAsRead(n);
    }

    if (n.type === 'new-offer') {
      const offer = this.offersById[n.refId];

      if (!offer) {
        console.warn('Offer not loaded yet', n.refId);
        return; // ⛔ ничего не делаем
      }

      this.openOfferDetailModal(offer);
    }

    if(n.type === 'product-expired'){
      this.openProductDetails(n.refId);
    }

    if(n.type === 'evaluation-created' || n.type === 'evaluation-accepted' || n.type === 'evaluation-updated'){
      this.openEvaluationDetailModal(n.refId);
    }

  }

  openPawnshopDetail(id:string){
    this.router.navigate(['/pawnshop-detail',id])
  }

  openEvaluationDetailModal(evaluationId:string){
    const modalRef = this.modalService.open(EvaluationDetailComponent,{
      size:'lg',
      centered:true
    });

    modalRef.componentInstance.evaluationId = evaluationId;
  }

  markAsRead(notification: AppNotification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id!).subscribe(() => {
        notification.isRead = true;
      });
    }
  }

  get hasActiveDeal(): boolean {
    if (!this.user || !this.offersById) return false;

    // Проверяем, есть ли активное предложение, где пользователь — владелец продукта
    return Object.values(this.offersById).some(
      o => o.productOwnerId === this.user!._id && o.status === 'in_inspection'
    );
  }

  get filteredOfferNotifications() {
    let notifications = (this.notificationsList || []).filter(n =>
      [
        'new-offer',
        'offer-accepted',
        'offer-rejected',
        'offer-canceled',
        'evaluation-created',
        'evaluation-accepted',
        'evaluation-updated'
      ].includes(n.type)
    );

    // 🔹 группировка по refId (оставляем последнее)
    const latestByRefId = Object.values(
      notifications.reduce((acc, n) => {
        if (!acc[n.refId] || new Date(acc[n.refId].createdAt) < new Date(n.createdAt)) {
          acc[n.refId] = n;
        }
        return acc;
      }, {} as Record<string, AppNotification>)
    );

    // 🔹 SENT / RECEIVED
    if (this.offerSection === 'sent') {
      notifications = latestByRefId.filter(n =>
        ['evaluation-created','evaluation-accepted','evaluation-updated'].includes(n.type)
      );
    } else {
      notifications = latestByRefId.filter(n =>
        ['new-offer','offer-accepted','offer-rejected','offer-canceled'].includes(n.type)
      );
    }

    // 🔹 статус фильтр (checkbox)
    const activeStatuses = Object.entries(this.statusFilter)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    if (activeStatuses.length > 0) {
      notifications = notifications.filter(n => {
        const item = this.offersById[n.refId] || this.evaluationsById[n.refId];
        if (!item) return false;

        return activeStatuses.includes(item.status);
      });
    }

    // 🔹 сортировка
    notifications.sort((a, b) => {
      if (this.sortByDate === 'newest') {
        return +new Date(a.createdAt) - +new Date(b.createdAt);
      }
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });

    return notifications;
  }

  getActiveFilterCount(): number {
    return Object.values(this.statusFilter).filter(v => v).length;
  }
  clearAllFilters() {
    // сброс чекбоксов
    Object.keys(this.statusFilter).forEach(key => {
      this.statusFilter[key] = false;
    });

    // сброс сортировки (по умолчанию)
    this.sortByDate = 'newest';
  }

  private getOfferByNotification(n: AppNotification): Offer | null {
    this.pawnshopIdFromOffer = this.offersById[Object.keys(this.offersById)[0]]?.pawnshopId;
    return this.offersById?.[n.refId] ?? null;
  }

  get activeOfferNotifications() {
    return (this.notificationsList || []).filter(n => {

      if (![
        'new-offer',
        'offer-accepted',
        'offer-rejected',
        'evaluation-accepted'
      ].includes(n.type)) {
        return false;
      }

      const entity = this.getEntityByNotification(n);
      console.log('Checking notification', n.type, n.refId, 'entity', entity);
      if (!entity) return false;

      return ['pending','in_inspection'].includes(entity.status);
    });
  }

  get completedOfferNotifications() {
    return (this.notificationsList || []).filter(n => {
      if (!['new-offer','offer-accepted','offer-rejected','offer-canceled'].includes(n.type)) {
        return false;
      }

      const offer = this.getOfferByNotification(n);
      return offer && ['rejected', 'completed','rejected_by_pawnshop'].includes(offer.status);
    });
  }

  get sentEvaluationNotifications() {
    const evalNotifications = (this.notificationsList || [])
      .filter(n => ['evaluation-created','evaluation-accepted','evaluation-rejected'].includes(n.type));

    // группируем по refId, чтобы оставить только одно уведомление на evaluation
    const latestByEvaluation = Object.values(
      evalNotifications.reduce((acc, n) => {
        if (!acc[n.refId] || new Date(acc[n.refId].createdAt) < new Date(n.createdAt)) {
          acc[n.refId] = n;
        }
        return acc;
      }, {} as Record<string, AppNotification>)
    );

    return latestByEvaluation;
  }

  get offerNotifications() {
    const offerTypes = [
      'new-offer',
      'offer-accepted',
      'offer-rejected',
      'offer-canceled',
      'evaluation-created',
      'evaluation-accepted',
      'evaluation-updated'
    ];

    const notifications = (this.notificationsList || []).filter(n => offerTypes.includes(n.type));

    // группируем по refId
    const latestByRefId = Object.values(
      notifications.reduce((acc, n) => {
        // если у нас уже есть уведомление для этого refId, оставляем только более свежее
        if (!acc[n.refId] || new Date(acc[n.refId].createdAt) < new Date(n.createdAt)) {
          acc[n.refId] = n;
        }
        return acc;
      }, {} as Record<string, AppNotification>)
    );

    // фильтруем по статусу/разделу
    return latestByRefId.filter(n => {
      // SENT: только evaluation
      if (this.offerSection === 'sent') {
        return ['evaluation-created', 'evaluation-accepted', 'evaluation-rejected', 'evaluation-updated'].includes(n.type);
      }

      const offer = this.offersById?.[n.refId];
      if (!offer) return false;

      // if (this.offerSection === 'active') {
      //   return offer.status === 'pending' || offer.status === 'in_inspection';
      // }

      return ['rejected','completed','no_show','rejected_by_pawnshop'].includes(offer.status);
    });
  }

  get evaluationNotifications() {
    return (this.notificationsList || []).filter(n =>
      [
        'evaluation-created',
        'evaluation-accepted',
        'evaluation-updated'
      ].includes(n.type)
    );
  }

  getEntityByNotification(n: AppNotification): Offer | Evaluation | null {

    const evaluationTypes = [
      'evaluation-created',
      'evaluation-accepted',
      'evaluation-rejected',
      'evaluation-updated'
    ];

    if (evaluationTypes.includes(n.type)) {
      return this.evaluationsById?.[n.refId] ?? null;
    }

    return this.offersById?.[n.refId] ?? null;
  }

  get systemNotifications() {
    return (this.notificationsList || []).filter(n => n.type === 'system' || n.type === 'product-expired' || n.type === 'extend-approved');
  }

  get unreadSystemNotificationsCount() {
    return this.systemNotifications.filter(n => !n.isRead).length;
  }

  get loanNotifications(){
    return (this.notificationsList || []).filter(n => n.type === 'slot-created')
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
      ['new-offer','offer-accepted','offer-rejected','offer-cancelled','evaluation-updated','evaluation-accepted','evaluation-created'].includes(n.type) && !n.isRead
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

  // In your component class:
    getDaysLeft(slot: any): number {
      const now = new Date();
      const end = new Date(slot.endDate);
      return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    getAbsDaysLeft(slot: any): number {
      return Math.abs(this.getDaysLeft(slot));
    }

    isOverdue(slot: any): boolean {
      return slot.status === 'active' && this.getDaysLeft(slot) <= 0;
    }

    isExpiringSoon(slot: any): boolean {
      const days = this.getDaysLeft(slot);
      return slot.status === 'active' && days > 0 && days <= 3;
    }

    getTotalToReturn(slot: Slot) {
      const start = new Date(slot.startDate);
      const end = new Date(slot.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      return slot.loanAmount * (1 + slot.interestRate * days);
    }

}
