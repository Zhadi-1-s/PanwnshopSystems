import { Component, Input } from '@angular/core';

import { Product } from '../../../../shared/interfaces/product.interface';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-viewall',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewall.component.html',
  styleUrl: './viewall.component.scss'
})
export class ViewallComponent {

  @Input() title:string;

  @Input() type!: 'products' | 'pawnshops'; // определяем тип
  @Input() items!: any[];

  constructor(
    public activeModal:NgbActiveModal
  ){}

   isProducts(): boolean {
    return this.type === 'products';
  }

  isPawnshops(): boolean {
    return this.type === 'pawnshops';
  }

}
