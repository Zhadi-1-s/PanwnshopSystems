import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Offer } from '../../../../shared/interfaces/offer.interface';
import { OfferService } from '../../../../shared/services/offer.service';

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './offer-modal.component.html',
  styleUrl: './offer-modal.component.scss'
})
export class OfferModalComponent {

  @Input() productId!:string;
  @Input() pawnshopId!:string;
  @Input() productOwnerId:string;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private offerService:OfferService
  ){

  }

  offerForm = this.fb.group({
    price: ['', [Validators.required, Validators.min(1)]],
    message: ['']
  });

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

}
