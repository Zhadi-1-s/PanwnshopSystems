import { Component,Input, OnInit } from '@angular/core';
import { Slot } from '../../../../shared/interfaces/slot.interface';
import { CommonModule } from '@angular/common';
import { LoanStatus, Status } from '../../../../shared/enums/status.enum';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SlotExtendComponent } from '../slot-extend/slot-extend.component';
import { User } from '../../../../shared/interfaces/user.interface';
import { SlotService } from '../../../../shared/services/slot.service';
import { take } from 'rxjs/internal/operators/take';
import { SlotDeleteComponent } from '../slot-delete/slot-delete.component';
import { LombardService } from '../../../../shared/services/lombard.service';

@Component({
  selector: 'app-slot-detail',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './slot-detail.component.html',
  styleUrl: './slot-detail.component.scss'
})
export class SlotDetailComponent implements OnInit {

  @Input() slotId:string;
  @Input() user:User;
  Status = LoanStatus

  slot:Slot;

  daysUsed!: number;
  absoluteDays!: number;
  accruedInterest!: number;
  progress!: number;
  daysDiff!: number;

  pawnshopTermFee: { type: string; value: number };

  constructor(
    public activeModal:NgbActiveModal,
    private modalService:NgbModal,
    private slotService:SlotService,
    private pawnshopService:LombardService
  ){
  }

  ngOnInit(): void {
    this.loadSlot();
    this.pawnshopService.getLombardByUserId(this.user._id).subscribe(
      pawnshop => {
        this.pawnshopTermFee = pawnshop?.terms?.fees;

      }
    )
  } 

  confirmDeleteSlot(slotId:string){
    const modalRef = this.modalService.open(SlotDeleteComponent, { centered: true });
    
    if(modalRef.result){
      modalRef.result.then((result) => {
        if (result === 'confirm') {
          this.finishSlot(slotId);
        }
      });
    }

  }

  finishSlot(slotId:string){
    this.slotService.updateSlotStatus(slotId, { status: LoanStatus.CLOSED, userId: this.user._id }).subscribe({
      next:updatedSlot => {
        console.log('Slot updated:', updatedSlot);
      }
    });
  }
  extendSlot(slot:Slot){}

  deleteSlot(slotId:string){}

  private loadSlot() {
    this.slotService.getSlotById(this.slotId)
      .pipe(take(1))
      .subscribe(slot => {
        this.slot = slot;
        console.log('Loaded slot:', slot);
        this.calculate();
        this.loadPawnshop(slot.pawnshopId);
      });
      
  }

  loadPawnshop(pawnshopId: string) {
    this.pawnshopService.getLombardById(pawnshopId).subscribe(pawnshop => {
      this.pawnshopTermFee = pawnshop?.terms?.fees;
    });
  }

  private calculate(){
    if (!this.slot) {
      return;
    }
    const now = Date.now();

    const start = new Date(this.slot.startDate).getTime();
    const end = new Date(this.slot.endDate).getTime();

    

    this.daysDiff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    // прогресс
    this.progress = ((now - start) / (end - start)) * 100;
    this.progress = Math.min(Math.max(this.progress, 0), 100);

    // дни до окончания и абсолютные дни
    this.daysUsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    this.absoluteDays = Math.abs(Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    // начисленные проценты
    const dailyInterest = this.slot.loanAmount * (this.slot.interestRate / 100);
    this.accruedInterest = Math.max(this.daysUsed, 0) * dailyInterest;
    console.log(this.daysDiff, this.absoluteDays, this.accruedInterest, this.progress);
  }

  calculateTotalAmount(): number {
    if (!this.slot) return 0;

    const start = new Date(this.slot.startDate).getTime();
    const end = new Date(this.slot.endDate).getTime();

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const dailyInterest = this.slot.loanAmount * (this.slot.interestRate / 100);

    const totalInterest = totalDays * dailyInterest;

    const fee =
    this.pawnshopTermFee?.type === 'percent'
      ? this.slot.loanAmount * (this.pawnshopTermFee.value / 100)
      : this.pawnshopTermFee?.type === 'fixed'
      ? this.pawnshopTermFee.value
      : 0;

    return this.slot.loanAmount + totalInterest + fee;
  }

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
    modalRef.componentInstance.user = this.user;

  }

}
