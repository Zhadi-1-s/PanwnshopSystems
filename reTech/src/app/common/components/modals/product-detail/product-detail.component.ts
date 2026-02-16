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
import { ProductService } from '../../../../shared/services/product.service';
import { ProductStatus } from '../../../../shared/enums/status.enum';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [TranslateModule,CommonModule,ImageViewComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit{

  @Input() pawnshop: PawnshopProfile;
  @Input() user: User;
  
  @Input() productId:string;

  isExtending = false;

  canEdit = false;

  product:Product;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService:NgbModal,
    private productService:ProductService
  ) {
  }


 ngOnInit() {
    // console.log('INIT DETAIL:', {
    //   product: this.product,
    //   pawnshop: this.pawnshop,
    //   user: this.user
    // });

    if(this.productId && !this.product){
      this.productService.getProductById(this.productId).subscribe({
        next: (product) => {
          this.product = product;
          this.normalizePhotos();
          this.checkPermissions(); 
          console.log('Product loaded in modal:', this.product);

        },
        error: (err) => {
          console.error('Error loading product in modal:', err);
        }
      })
    }

  }

  private checkPermissions() {
    if (!this.product || !this.user) return;

    
    if ((this.product.ownerId as any)._id === this.user._id) {
      
      this.canEdit = true;
      return;
    }

    if (
      this.pawnshop &&
      this.product.ownerId === this.pawnshop._id &&
      this.pawnshop.userId === this.user._id
    ) {
      this.canEdit = true;
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

  private normalizePhotos(): void {
    if (!Array.isArray(this.product?.photos)) {
      this.product.photos = [];
      return;
    }

    this.product.photos = this.product.photos.map((photo: any) => {
      // если строка — превращаем в объект
      if (typeof photo === 'string') {
        return {
          url: photo,
          publicId: ''
        };
      }

      // если уже объект — оставляем как есть
      if (photo?.url) {
        return photo;
      }

      // на случай мусора
      return null;
    }).filter(Boolean);
  }

  extendSale() {
    if (!this.product?._id && this.isExtending) return;

    this.isExtending = true;

    this.productService
      .updateProduct(this.product._id, { status: ProductStatus.ACTIVE })
      .subscribe({
        next: updated => {
          this.product = updated; // обновим локально
          this.isExtending = false;
          this.activeModal.close(updated);
        },
        error: err => {console.error(err),this.isExtending = false;}
      });
  }

}
