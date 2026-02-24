import { Component,Input } from '@angular/core';
import { Slot } from '../../../../shared/interfaces/slot.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { User } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-slot-extend',
  standalone: true,
  imports: [TranslateModule,DecimalPipe,CommonModule],
  templateUrl: './slot-extend.component.html',
  styleUrl: './slot-extend.component.scss'
})
export class SlotExtendComponent {

  @Input() slot:Slot;
  @Input() user:User;
  constructor(
    public activeModal:NgbActiveModal
  ){}

  confirmExtend() {
    // Для MVP — просто обновляем даты
    const today = new Date();
    const termDays = 30; // фиксированный срок для MVP
    const newEnd = new Date(today);
    newEnd.setDate(today.getDate() + termDays);

    this.slot.startDate = today;
    this.slot.endDate = newEnd;

    // Закрываем модалку и возвращаем обновлённый слот
    this.activeModal.close(this.slot);
  }

  close() {
    this.activeModal.dismiss();
  }

  // Сколько дней прошло с начала займа
  getDaysUsed(slot: Slot): number {
    const start = new Date(slot.startDate).getTime();
    const now = Date.now();
    return Math.ceil((now - start) / (1000 * 60 * 60 * 24));
  }

  // Накопленные проценты
  getAccruedInterest(slot: Slot): number {
    const days = this.getDaysUsed(slot);
    return slot.loanAmount * slot.interestRate / 100 * days;
  }

  // Для отображения, сколько дней просрочки
  getOverdueDays(slot: Slot): number {
    const end = new Date(slot.endDate).getTime();
    const now = Date.now();
    const diff = now - end;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }

}
