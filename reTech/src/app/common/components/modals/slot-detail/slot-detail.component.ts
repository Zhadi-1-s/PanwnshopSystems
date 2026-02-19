import { Component,Input } from '@angular/core';
import { Slot } from '../../../../shared/interfaces/slot.interface';
import { CommonModule } from '@angular/common';
import { LoanStatus, Status } from '../../../../shared/enums/status.enum';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-slot-detail',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './slot-detail.component.html',
  styleUrl: './slot-detail.component.scss'
})
export class SlotDetailComponent {

  @Input() slot:Slot

  Status = LoanStatus

  constructor(
    public activeModal:NgbActiveModal
  ){

  }

  finishSlot(slot:Slot){}
  extendSlot(slot:Slot){}
  deleteSlot(slorId:string){}

  getProgress(startDate: any, endDate: any): number {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    if (end <= start) return 0;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
  closeModal(){}

  getDaysRemaining(endDate:any){}

  copyToClipboard(pawnshopId:string){}

}
