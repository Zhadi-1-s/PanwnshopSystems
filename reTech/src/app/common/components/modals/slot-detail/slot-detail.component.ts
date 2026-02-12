import { Component,Input } from '@angular/core';
import { Slot } from '../../../../shared/interfaces/slot.interface';
import { CommonModule } from '@angular/common';
import { LoanStatus, Status } from '../../../../shared/enums/status.enum';

@Component({
  selector: 'app-slot-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slot-detail.component.html',
  styleUrl: './slot-detail.component.scss'
})
export class SlotDetailComponent {

  @Input() slot:Slot

  Status = LoanStatus

}
