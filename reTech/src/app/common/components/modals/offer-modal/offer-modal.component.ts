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

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './offer-modal.component.html',
  styleUrl: './offer-modal.component.scss'
})
export class OfferModalComponent implements OnInit {

  @Input() productId!:string;
  @Input() pawnshopId!:string;
  @Input() productOwnerId:string;

  pawnshopTerm : PawnshopTerms

  product:Product;

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
        this.calculateLoanOffer();
      }
    });
  }

  submit() {
    if (this.offerForm.invalid) return;

    const offer: Offer = {
      productId: this.productId,
      pawnshopId: this.pawnshopId,
      productOwnerId: this.productOwnerId,
      price: Number(this.offerForm.value.price),
      message: this.offerForm.value.message || '',
      status: 'pending'
    };

    this.offerService.createOffer(offer).subscribe((next) => {
      console.log(next, 'Offer sended succesfully')
      this.activeModal.close(offer); 
    })

  }

  cancel() {
    this.activeModal.dismiss();
  }

  calculateLoanOffer() {
    const basePrice = this.product.price;
    const terms = this.pawnshopTerm;

    // 1. Проверяем процент корректировки цены (например, ±10%)
    const maxPrice = basePrice * (1 + terms.priceAdjustmentLimitPercent / 100);
    const minPrice = basePrice * (1 - terms.priceAdjustmentLimitPercent / 100);

    // 2. Учитываем лимиты самого ломбарда
    const finalMin = Math.max(minPrice, terms.limits.minAmount || 0);
    const finalMax = Math.min(maxPrice, terms.limits.maxAmount);

    // 3. Устанавливаем валидаторы динамически
    this.offerForm.get('price')?.setValidators([
      Validators.required,
      Validators.min(finalMin),
      Validators.max(finalMax)
    ]);

    // Предзаполняем цену (например, рекомендуемую)
    this.offerForm.patchValue({ price: basePrice.toString() });
    
    this.offerForm.get('price')?.updateValueAndValidity();
  }

}
