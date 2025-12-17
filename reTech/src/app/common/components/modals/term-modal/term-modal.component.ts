import { Component,Input } from '@angular/core';
import { PawnshopTerms } from '../../../../shared/interfaces/pawnshopTerm.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-term-modal',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './term-modal.component.html',
  styleUrl: './term-modal.component.scss'
})
export class TermModalComponent {

  @Input() terms:PawnshopTerms;

  constructor(public modal: NgbActiveModal) {}

  close() {
    this.modal.close();
  }

}
