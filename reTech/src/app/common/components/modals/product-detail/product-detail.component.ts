import { Component, Input ,OnInit,OnChanges, SimpleChanges} from '@angular/core';
import { Product } from '../../../../shared/interfaces/product.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ImageViewComponent } from '../../image-view/image-view.component';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { User } from '../../../../shared/interfaces/user.interface';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { OfferModalComponent } from '../offer-modal/offer-modal.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [TranslateModule,CommonModule,ImageViewComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit,OnChanges {

  @Input() product: Product;
  @Input() pawnshop: PawnshopProfile;
  @Input() user: User;
  
  canEdit = false;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService:NgbModal
  ) {
  }
  
  ngOnChanges(changes: SimpleChanges): void {
      if (changes['user']) {
        console.log('USER ПРИШЁЛ В МОДАЛКУ:', this.user);
      }
      if (changes['pawnshop']) {
        console.log('PAWNSHOP ПРИШЁЛ В МОДАЛКУ:', this.pawnshop);
      }
      if (changes['product']) {
        console.log('PRODUCT ПРИШЁЛ В МОДАЛКУ:', this.product);
      }
  }

 ngOnInit() {
    // console.log('INIT DETAIL:', {
    //   product: this.product,
    //   pawnshop: this.pawnshop,
    //   user: this.user
    // });

    if (!this.product || !this.user) return;

    if (this.product.ownerId === this.user._id) {

      this.canEdit = true;
      return;
    }

     console.log('ngOnInit PRODUCT:', this.product, 'type of ownerId:', typeof this.product.ownerId);
      console.log('ngOnInit PAWNSHOP:', this.pawnshop, 'type of _id:', this.pawnshop?._id);

    if (
      this.pawnshop &&
      this.product.ownerId === this.pawnshop._id &&
       this.pawnshop.userId === this.user._id
    ) {
      console.log('pawnshop._id', this.pawnshop._id);
      this.canEdit = true;
      return;
    }

  }


  sendOffer(){
    const modalRef = this.modalService.open(OfferModalComponent, {
      centered: true,
      backdrop: 'static'
    });
    console.log(this.product._id)
    console.log(this.pawnshop._id)
    modalRef.componentInstance.productId = this.product._id
    modalRef.componentInstance.pawnshopId = this.pawnshop._id;
    modalRef.componentInstance.productOwnerId = this.product.ownerId;

    modalRef.result.then(result => {
      if (result) {
        console.log('Полученные данные оффера:', result);
        // здесь можешь отправить на бэк
      }
    });

  }

  onPhotoRemoved(index: number) {
    this.product.photos.splice(index, 1);
  }

  onPhotoAdded() {
    console.log('Open upload dialog...');
  }

}
