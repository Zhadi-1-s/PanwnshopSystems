import { Component,Input } from '@angular/core';
import { Slot } from '../../../../shared/interfaces/slot.interface';
import { CommonModule } from '@angular/common';
import { LoanStatus, Status } from '../../../../shared/enums/status.enum';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SlotExtendComponent } from '../slot-extend/slot-extend.component';

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
    public activeModal:NgbActiveModal,
    private modalService:NgbModal
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
  closeModal(){
    this.activeModal.close();
  }

  getDaysDiff(endDate: any): number {
    if (!endDate) return 0;

    const now = new Date();
    const end = new Date(endDate);

    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  getAbsoluteDays(endDate: any): number {
    return Math.abs(this.getDaysDiff(endDate));
  }

  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value)
      .then(() => {
        console.log('Скопировано в буфер обмена:', value);
        // тут можно ещё показать уведомление пользователю
      })
      .catch(err => {
        console.error('Ошибка при копировании', err);
      });
  }
  calculateInterest(slot: Slot): number {
    const start = new Date(slot.startDate).getTime();
    const now = Date.now();

    const daysUsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));

    const dailyInterest = slot.loanAmount * (slot.interestRate / 100);

    return Math.max(daysUsed, 0) * dailyInterest;
  }

  openExtendSlotModal(slot:Slot){
    const modalRef = this.modalService.open(SlotExtendComponent,{size:'medium',centered:true})

    modalRef.componentInstance.slot = slot;

  }

}
