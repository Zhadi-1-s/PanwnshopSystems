import { CommonModule } from '@angular/common';
import { Component, OnInit,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../../shared/interfaces/user.interface';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { LombardService } from '../../../shared/services/lombard.service';
import { AuthService } from '../../../shared/services/auth.service';
import { NgbModal, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { EditLombardComponent } from '../../components/modals/edit-lombard/edit-lombard.component';
import { Product } from '../../../shared/interfaces/product.interface';
import { CreateProductComponent } from '../../components/modals/create-product/create-product.component';
import { ProductService } from '../../../shared/services/product.service';
import { ViewallComponent } from '../../components/modals/viewall/viewall.component';
import { EditProductComponent } from '../../components/modals/edit-product/edit-product.component';
import { ProductDetailComponent } from '../../components/modals/product-detail/product-detail.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateSlotComponent } from '../../components/modals/create-slot/create-slot.component';
import { Slot } from '../../../shared/interfaces/slot.interface';
import { SlotService } from '../../../shared/services/slot.service';
import { switchMap,Observable,tap,filter,of,forkJoin,map, take, catchError } from 'rxjs';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppNotification } from '../../../shared/interfaces/notification.interface';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification.service';
import { CreateTermComponent } from '../../components/modals/create-term/create-term.component';
import { TermModalComponent } from '../../components/modals/term-modal/term-modal.component';
import { PawnshopTerms } from '../../../shared/interfaces/pawnshopTerm.interface';
import { EvaluationService } from '../../../shared/services/evaluation.service';
import { error } from 'console';
import { EvaluationDetailComponent } from '../../components/modals/evaluation-detail/evaluation-detail.component';
import { OfferService } from '../../../shared/services/offer.service';
import { UserService } from '../../../shared/services/user.service';
import { SlotDetailComponent } from '../../components/modals/slot-detail/slot-detail.component';
import { Offer } from '../../../shared/interfaces/offer.interface';

@Component({
  selector: 'app-lombard-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModalModule,
    NgbTooltipModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './lombard-profile.component.html',
  styleUrl: './lombard-profile.component.scss'
})
export class LombardProfileComponent implements OnInit{
  
  profile: PawnshopProfile | null = null;
  items:Product[] | null;
  user:User | null;
  currentTime: Date = new Date();
  productslist : Product[] | null;
  notificationsList:any[] = [];
  prodcuctsFromNotifications: Record<string, Product | null> = {};
  usersFromNotifications:Record<string,User> = {}
  productofSlot:Product | null;

  offersById: Record<string, Offer> = {};

  activeSlots:Slot[] | null;

  slotWithProduct: { slot: Slot; product: Product }[] = [];

  @ViewChild('itemsTable') itemsTable!: ElementRef;

  profile$!: Observable<PawnshopProfile>;
 
  private slotsSubject = new BehaviorSubject<{ slot: Slot; product: Product }[]>([]);
  slotsWithProducts$ = this.slotsSubject.asObservable();
  products$!: Observable<Product[]>;
  notifications$!: Observable<AppNotification[]>;
  fromUserNotifications$:Observable<AppNotification>

  offerFilter: 'all' | 'sent' | 'received' = 'all';

  isOfferFilterOpen = false;
  offersLoading = true;
  viewMode:boolean = true;
  isEditing:boolean = false;

  statusFilter = {
    rejected:false,
    in_inspection:false,
    pending:false,
    completed:false
  }
  sortByDate: 'newest' | 'oldest' = 'newest';

  selectedTab: 'active' | 'inactive' = 'active';
  activeSection: 'offers' | 'system' | 'chats' | 'others' = 'offers';
  sections = [
    { id: 'offers', label: 'Offers' },
    { id: 'system', label: 'System' },
    { id: 'chats', label: 'Chats', disabled: true },
    { id: 'others', label: 'Others' },
  ];

  constructor(
    private lombardService:LombardService,
    private authService:AuthService,
    private modalService: NgbModal,
    private productService:ProductService,
    private slotService:SlotService,
    private notificationService:NotificationService,
    private evaluationService:EvaluationService,
    private offerService:OfferService,
    private userService:UserService
    
  ){}

  ngOnInit() {

    this.profile$ = this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.lombardService.getLombardByUserId(user._id)),
      tap(profile =>  this.profile = profile)
    );

    this.products$ = this.productService.getProducts();

    this.profile$
      .pipe(
        filter(profile => !!profile?._id),
        take(1) // ⚠️ важно, чтобы не дергать повторно
      )
      .subscribe(profile => {
        this.productService.loadProductsByOwner(profile._id);
    });

    this.notifications$ = this.profile$.pipe(
      switchMap(profile =>
        this.notificationService.getUserNotifications(profile._id)
      ),

      tap(notifications => {
        this.notificationsList = [
          ...(this.notificationsList || []),
          ...notifications
        ];
      }),

      switchMap(notifications => {
        const refNotifications = notifications.filter(n => n.refId);
        const senderIds = [...new Set(
          notifications.map(s => s.senderId).filter(Boolean)
        )];

        const users$ = senderIds.length
          ? forkJoin(
              senderIds.map(id =>
                this.userService.getuserByid(id).pipe(
                  map(user => ({ id, name: user.name })),
                  catchError(() => of({ id, name: null }))
                )
              )
            )
          : of([]);

        const refs$ = refNotifications.length
          ? forkJoin(
              refNotifications.map(n => {
                if (!n.refId) {
                  return of(null);
                }

                switch (n.type) {

                  // ===== OFFERS =====
                  case 'new-offer':
                  case 'offer-accepted':
                  case 'offer-rejected':
                  case 'offer-updated':
                    return this.offerService.getOfferById(n.refId).pipe(
                      map(data => ({ id: n.refId, data })),
                      catchError(() => of({ id: n.refId, data: null }))
                    );

                  // ===== PRODUCTS =====
                  case 'product-sold':
                  case 'price-changed':
                    return this.productService.getProductById(n.refId).pipe(
                      map(data => ({ id: n.refId, data })),
                      catchError(() => of({ id: n.refId, data: null }))
                    );

                  // ===== CHATS =====
                  case 'new-message':

                  // ===== SYSTEM / UNKNOWN =====
                  case 'system':
                  default:
                    return of(null);
                }
              })
            )
          : of([]);



        return forkJoin({ users: users$, refs: refs$ }).pipe(
          tap(({ users, refs }) => {
            // console.log('✅ USERS LOADED:', users);
            // console.log('✅ REFS LOADED:', refs);

            this.usersFromNotifications = {
              ...(this.usersFromNotifications || {}),
              ...Object.fromEntries(users.map(u => [u.id, u.name]))
            };

            this.prodcuctsFromNotifications = {
              ...this.prodcuctsFromNotifications,
              ...Object.fromEntries(refs.map(r => [r.id, r.data]))
            };
          }),
          map(() => notifications) 
        );
      })
    );
    this.loadOffers();
    this.loadSlots();
    console.log('has active deal afete onInit', this.hasActiveDeal);
    console.log('offersBy id in ngONinit', this.offersById);
  }

  loadOffers() {
     this.authService.currentUser$.pipe(
       filter((user): user is User => !!user?._id),
       switchMap(user => this.lombardService.getLombardByUserId(user._id)),
       switchMap(pawnshop => this.offerService.getOffersByPawnshop(pawnshop._id))
     ).subscribe(offers => {
        this.offersById = Object.fromEntries(offers.map(o => [o._id, o]));
        this.offersLoading = false;
        console.log('Offers by ID:', this.offersById);
        console.log('hasActive deal', this.hasActiveDeal);
       // Добавляем в notificationsList как "тип оффер"
       const normalized = offers.map(o => ({
         _id: o._id,
         type: 'sent-offer' as const,
         title: `Offer for product`,
         message: `Price: ${o.price} ₸` + (o.message ? ` — ${o.message}` : ''),
         refId: o.productId,     
         isRead: true,          
         createdAt: o.createdAt || new Date(),
         data: o                    
       }));
       console.log('Normalized offers',normalized)
       this.notificationsList = [
         ...this.notificationsList,
         ...normalized
       ];

       const refIds = normalized.map(n => n.refId);

       forkJoin(
         refIds.map(id => 
          this.productService.getProductById(id).pipe(
            map(product => ({id,data:product,type:'product'})),
            catchError(() => of({id,data:null,type:'unknown'}))
          )
         )
       ).subscribe(items => 
        {
          this.prodcuctsFromNotifications = { 
            ...(this.prodcuctsFromNotifications || {}),
            ...Object.fromEntries(items.map( i=> [i.id, i.data]))
          },
          console.log('ProductsfromNotificaation after offerProduct added',this.prodcuctsFromNotifications)
        }
       )
       
       console.log(this.notificationsList,"here is the notificaiton list after offers added")
     });
   }

  loadSlots() {
    this.authService.currentUser$.pipe(
      filter((user): user is User => !!user?._id),
      switchMap(user => this.lombardService.getLombardByUserId(user._id)),
      switchMap(pawnshop => this.slotService.getSlotsByPawnshopId(pawnshop._id)),
      map(slots => slots.filter(slot => slot.status === 'active')),
      switchMap(activeSlots => {
        if (activeSlots.length === 0) return of([]);
        const requests = activeSlots.map(slot =>
          this.productService.getProductById(slot.product).pipe(map(product => ({ slot, product })))
        );
        return forkJoin(requests);
      })
    ).subscribe(data => this.slotsSubject.next(data));
  }

   get hasActiveDeal(): boolean {
    if (!this.offersById) return false;

    return Object.values(this.offersById).some(
      o =>  o.status === 'in_inspection'
    );
  }

  editableDescription = '';

  toggleEdit() {
    this.isEditing = true;
    this.editableDescription = this.profile?.description || '';
  }

  saveDescription() {
    if(!this.profile?._id) return;

    const updatedLombard: Partial<PawnshopProfile> = {
      userId: this.profile?.userId || '',
      name: this.profile?.name || '',
      address: this.profile?.address || '',
      phone: this.profile?.phone || '',
      slotLimit: this.profile?.slotLimit || 0,
      description: this.editableDescription,
    };

     this.lombardService.updateLombard(this.profile._id, updatedLombard)
    .subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile; 
        this.isEditing = false; 
        console.log('Description updated:', updatedProfile);
      },
      error: (err) => {
        console.error('Error updating lombard:', err);
      }
    });
  }

  cancelEdit(){
    this.isEditing = false;
  }

  markAsRead(notification:AppNotification){
    if (!notification._id || notification.isRead) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: updatedNotification => {
        notification.isRead = true;
      },
      error: err => console.error(err)
    });

  }

  get isOpenNow(): boolean {
    if (!this.profile?.openTime || !this.profile?.closeTime) return false;
    
    const now = new Date();
    const [openH, openM] = this.profile.openTime.split(':').map(Number);
    const [closeH, closeM] = this.profile.closeTime.split(':').map(Number);
    
    const open = new Date();
    open.setHours(openH, openM, 0);

    const close = new Date();
    close.setHours(closeH, closeM, 0);

    return now >= open && now <= close;
  }
  
  get offerNotifications() {
    let offers = (this.notificationsList || []).filter(n =>
      ['new-offer', 'sent-offer'].includes(n.type)
    );

    // 1️⃣ sent / received
    if (this.offerFilter === 'sent') {
      offers = offers.filter(n => n.type === 'sent-offer');
    }

    if (this.offerFilter === 'received') {
      offers = offers.filter(n => n.type === 'new-offer');
    }

    // 2️⃣ status (rejected / sold)
    if (this.statusFilter.rejected || this.statusFilter.completed || this.statusFilter.in_inspection || this.statusFilter.pending) {
      offers = offers.filter(n => {
        const status = n.data?.status; // <-- важно
        return (
          (this.statusFilter.rejected && status === 'rejected') ||
          (this.statusFilter.completed && status === 'sold') || 
          (this.statusFilter.in_inspection && status === 'in_inspection') ||
          (this.statusFilter.pending && status === 'pending')
        );
      });
    }

    // 3️⃣ sort by date
    offers = offers.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return this.sortByDate === 'newest'
        ? bDate - aDate
        : aDate - bDate;
    });

    return offers;
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

  get unreadOfferNotifications() {
    return (this.notificationsList || []).filter(
      n => ['new-offer','offer-accepted','offer-rejected'].includes(n.type) && !n.isRead
    );
  }

  getStars(rating: number = 0): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
  }

  editProduct(item:Product){
    const modalRef = this.modalService.open(EditProductComponent,{size:'lg'});

    modalRef.componentInstance.product = item;
    modalRef.result.then(
      (updatedProduct:Product) => {
        if(updatedProduct){

          this.productslist = this.productslist?.map(prod => prod._id === updatedProduct._id ? updatedProduct : prod) || null;
        }
      },
      () => {}
    )
  }
  deleteProduct(id:string){
    this.productService.deleteProduct(id).subscribe({
      next:()=>{
        this.productslist = this.productslist?.filter(prod => prod._id !== id) || null;
      }
    });
  }

  openEditModal(){}

  openTerms() {
    const terms = this.profile?.terms;
    console.log('Current terms:', terms);

    const hasTerms = terms && Object.values(terms).some(value => {
      // если строка — проверяем пустую
      if (typeof value === 'string') return value.trim() !== '';
      // если число — проверяем больше нуля
      if (typeof value === 'number') return value > 0;
      return false;
    });

    if (hasTerms) {
      this.openTermsModal();   // показываем существующие terms
    } else {
      this.openCreateTermModal();   // создаём новые terms
    }
  }

  openCreateTermModal(){
    const modalRef = this.modalService.open(CreateTermComponent, { size: 'lg', centered: true });

    modalRef.componentInstance.pawnshopId = this.profile?._id;
  }

  openAddOfferModal(){
    const modalRef = this.modalService.open(CreateProductComponent, {size:'lg'});

    modalRef.componentInstance.ownerId = this.profile._id;
    // modalRef.result.then((result) => {
    //   if (result) this.loadProducts();
    // });
  }

  extendSlot(item:Slot){}
  
  deleteSlot(slotId: string) {
    this.slotService.deleteSlot(slotId).subscribe({
      next: () => {
        const updated = this.slotsSubject.value.filter(item => item.slot._id !== slotId);
        this.slotsSubject.next(updated);
      },
      error: err => console.error(err)
    });
  }

  openEditLombard(){
    const modalRef = this.modalService.open(EditLombardComponent,{centered:true})

    modalRef.componentInstance.lombard = this.profile;


    modalRef.result.then(
      (updatedShop:PawnshopProfile) => {
        if(updatedShop){
          this.profile = updatedShop
        }
      },
      () => {}
    )

  }

  openViewAllModal(){
    const modalRef = this.modalService.open(ViewallComponent, {
    size: 'lg',
    centered: true
  });
    modalRef.componentInstance.title = 'All Products';
    modalRef.componentInstance.type = 'products';
    modalRef.componentInstance.items = this.productslist;
  }

  // modalCondition(){
  //   if()
  // }

  openProductDetail(item: Product) {

    const modalRef = this.modalService.open(ProductDetailComponent, { size: 'lg',centered:true });

    modalRef.componentInstance.product = item;
    modalRef.componentInstance.user = this.user;
    modalRef.componentInstance.pawnshop = this.profile;
  }

  openCreateSlotModal(){
    
    this.profile$.pipe(take(1)).subscribe(profile => {
      const modalRef = this.modalService.open(CreateSlotComponent, {size:'lg'});

      modalRef.componentInstance.pawnshop = profile;
      modalRef.componentInstance.user = this.user;
      
      // modalRef.componentInstance.changeDetectorRef.detectChanges?.();
    })


  }

  

  openNotificationDetail(n: any) {
    if (n.type === 'sent-offer') {
      // если есть продукт в n.data
      if (n.data?.productId) {
        const product = this.prodcuctsFromNotifications[n.refId];
        if (product) {
          this.openProductDetail(product);
        }
      }
    } else if (n.type === 'new-offer') {
      this.openEvaluationDetail(n.refId);
    }
  }

  openEvaluationDetail(evaluationId: string) {

    const notification = this.notificationsList.find(
      n => n.refId === evaluationId
    );

    if (notification) {
      this.markAsRead(notification);
    }

    const modalRef = this.modalService.open(EvaluationDetailComponent, {
      size: 'lg',
      centered: true
    });

    modalRef.componentInstance.evaluationId = evaluationId;
  }


  openTermsModal(){
    const modalRef = this.modalService.open(TermModalComponent, { size: 'lg', centered: true });

    modalRef.componentInstance.terms = this.profile.terms;
  }

  openSlotDetails(item: Slot) {
      const modalRef = this.modalService.open(SlotDetailComponent,{size:'lg',centered:true});

      modalRef.componentInstance.slot = item;
  }
  editSlot(item: Slot) {}
  
  filterOpenItems(){

  }

   computeSlotUsagePercent(profile?: PawnshopProfile, products?: Product[]) {
    const active = profile?.activeSlots?.length || 0;
    const total = (profile as any)?.totalSlots ?? Math.max(active, 1);
    return Math.round((active / total) * 100);
  }

  
  toggleItemsList:boolean = false;
  scrollToTableItem() {
    this.itemsTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  hover = false;
  changeProfilePhoto() {
    // Logic to change profile photo
  }

}
