import { Component,Input, OnInit } from '@angular/core';
import { Offer } from '../../../../shared/interfaces/offer.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../shared/interfaces/user.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { error } from 'console';
import { Observable } from 'rxjs';
import { Product } from '../../../../shared/interfaces/product.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { OfferService } from '../../../../shared/services/offer.service';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [TranslateModule,CommonModule],
  templateUrl: './offer-detail.component.html',
  styleUrl: './offer-detail.component.scss'
})
export class OfferDetailComponent implements OnInit{

  @Input() offer:Offer;
  @Input() user:User;

  product$:Observable<Product>;

  constructor(
    private productService:ProductService,
    private modalService:NgbModal,
    private offerService:OfferService
  ){

  }

  ngOnInit() {
      this.product$ = this.productService.getProductById(this.offer.productId)
    
  }

  openProductDetail(product:Product){
    const modalRef = this.modalService.open(ProductDetailComponent)

    modalRef.componentInstance.product = product;

  }

  acceptOffer() {
    if (!this.offer._id) return;

    this.offerService.updateStatus(this.offer._id, 'accepted')
      .subscribe({
        next: updatedOffer => {
          this.offer.status = updatedOffer.status;
        },
        error: err => {
          console.error('Accept offer failed', err);
        }
      });
  }
  rejectOffer() {
    if (!this.offer._id) return;

    this.offerService.updateStatus(this.offer._id, 'rejected')
      .subscribe({
        next: updatedOffer => {
          this.offer.status = updatedOffer.status;
        },
        error: err => {
          console.error('Reject offer failed', err);
        }
      });
  }

}
