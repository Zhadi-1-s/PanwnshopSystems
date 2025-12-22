import { Component,Input, OnInit } from '@angular/core';
import { Offer } from '../../../../shared/interfaces/offer.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../shared/interfaces/user.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { error } from 'console';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [TranslateModule,CommonModule],
  templateUrl: './offer-detail.component.html',
  styleUrl: './offer-detail.component.scss'
})
export class OfferDetailComponent{

  @Input() offer:Offer;
  @Input() user:User;

}
