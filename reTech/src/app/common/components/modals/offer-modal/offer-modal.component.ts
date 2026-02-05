import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Offer } from '../../../../shared/interfaces/offer.interface';
import { OfferService } from '../../../../shared/services/offer.service';
import { PawnshopTerms } from '../../../../shared/interfaces/pawnshopTerm.interface';
import { LombardService } from '../../../../shared/services/lombard.service';
import { Product } from '../../../../shared/interfaces/product.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { forkJoin } from 'rxjs';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [ReactiveFormsModule,DecimalPipe,FormsModule,CommonModule],
  templateUrl: './offer-modal.component.html',
  styleUrl: './offer-modal.component.scss'
})
export class OfferModalComponent implements OnInit {

  @Input() productId!:string;
  @Input() pawnshopId!:string;
  @Input() productOwnerId:string;

  pawnshopTerm : PawnshopTerms

  product:Product;

  isLoan = false;

  loanDetails?: {
    rate: number;
    period: 'day' | 'month';
    loanTerm: number;
    estimatedRepayment: number;
  };

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private offerService:OfferService,
    private LombardService:LombardService,
    private productService:ProductService
  ){

  }

  offerForm = this.fb.group({
    price: ['', [Validators.required, Validators.min(1)]],
    message: ['']
  });

  ngOnInit(): void {
    forkJoin({
      lombard: this.LombardService.getLombardById(this.pawnshopId),
      product: this.productService.getProductById(this.productId)
    }).subscribe(({ lombard, product }) => {
      this.pawnshopTerm = lombard.terms;
      this.product = product;

      // Если тип товара - залог (loan), делаем расчеты
      if (this.product.type === 'loan') {
        this.isLoan = true;
        this.calculateLoanOffer();
      }
    });
    this.offerForm.get('price')?.valueChanges.subscribe(() => {
      if (this.isLoan) {
        this.calculateLoanOffer();
      }
    });
  }

  submit() {
    if (this.offerForm.invalid) return;

    const baseOffer = {
      productId: this.productId,
      pawnshopId: this.pawnshopId,
      productOwnerId: this.productOwnerId,
      price: Number(this.offerForm.value.price),
      message: this.offerForm.value.message || undefined
    };

    const payload: Partial<Offer> = this.isLoan
      ? {
          ...baseOffer,
          loanDetails: this.loanDetails
        }
      : baseOffer;

    this.offerService.createOffer(payload).subscribe({
      next: (offer) => {
        console.log('Offer sent successfully', offer);
        this.activeModal.close(offer);
      },
      error: (err) => {
        console.error('Failed to send offer', err);
      }
    });
  }

  cancel() {
    this.activeModal.dismiss();
  }

  calculateLoanOffer() {
    if (!this.product || !this.pawnshopTerm) return;

    const priceControl = this.offerForm.get('price');
    const loanAmount = Number(priceControl?.value);

    if (!loanAmount) {
      this.loanDetails = undefined;
      return;
    }

    const terms = this.pawnshopTerm;
    const loanTerm = this.product.loanTerm || 0;

    // --- проценты ---
    const { rate, period, startsAfterDays, minChargeDays } = terms.interest;

    let chargeDays = Math.max(loanTerm - startsAfterDays, 0);

    if (minChargeDays) {
      chargeDays = Math.max(chargeDays, minChargeDays);
    }

    let interestAmount = 0;

    if (period === 'day') {
      interestAmount = loanAmount * (rate / 100) * chargeDays;
    } else {
      interestAmount = loanAmount * (rate / 100) * (chargeDays / 30);
    }

    // --- комиссии ---
    let feeAmount = 0;

    if (terms.fees) {
      if (terms.fees.type === 'fixed') {
        feeAmount = terms.fees.value;
      } else {
        feeAmount = loanAmount * (terms.fees.value / 100);
      }
    }

    // --- итог ---
    const estimatedRepayment = Math.round(
      loanAmount + interestAmount + feeAmount
    );

    this.loanDetails = {
      rate,
      period,
      loanTerm,
      estimatedRepayment
    };
  }




}
