import { Component,Input, OnInit } from '@angular/core';
import { Offer } from '../../../../shared/interfaces/offer.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../shared/interfaces/user.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { error } from 'console';
import { map, Observable, tap } from 'rxjs';
import { Product } from '../../../../shared/interfaces/product.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { OfferService } from '../../../../shared/services/offer.service';
import { LombardService } from '../../../../shared/services/lombard.service';

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

  @Input() pawnshopId:string;

  countdown:string;
  inspectionDeadline:Date;

  product$:Observable<Product>;

  prod:Product;

  pawnshopAddress:string;

  constructor(
    private productService:ProductService,
    private modalService:NgbModal,
    private offerService:OfferService,
    private pawnshopService:LombardService
  ){

  }

  ngOnInit() {
      
      this.product$ = this.productService.getProductById(this.offer.productId).pipe(
        tap(product => {
          this.prod = product;
          console.log('Loaded product:', product);
        })
      )
      console.log('pawnshopId in offer detail:', this.pawnshopId);

      this.pawnshopService.getLombardById(this.pawnshopId).pipe(
        map(pawnshop => pawnshop.address),
        tap(address => {
          this.pawnshopAddress = address;
          console.log('Loaded pawnshop address:', address);
      })
    ).subscribe();

      if (this.offer?.status === 'in_inspection') {
        // допустим 48 часов после принятия оффера
        this.inspectionDeadline = new Date(this.offer.updatedAt);
        this.inspectionDeadline.setHours(this.inspectionDeadline.getHours() + 48);

        this.startCountdown();
      }
  }

  startCountdown() {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.inspectionDeadline.getTime() - now;

      if (distance <= 0) {
        this.countdown = 'Expired';
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      this.countdown = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  openProductDetail(product:Product){
    const modalRef = this.modalService.open(ProductDetailComponent)

    modalRef.componentInstance.product = product;

  }

  acceptOffer() {
    if (!this.offer._id) return;

    this.offerService.updateStatus(this.offer._id, 'in_inspection')
      .subscribe({
        next: updatedOffer => {
          this.offer.status = updatedOffer.status;
          window.alert(updatedOffer.status)
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
