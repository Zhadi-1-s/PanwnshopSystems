import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SlotCloseReason } from '../../../../shared/enums/status.enum';

@Component({
  selector: 'app-close-slot',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './close-slot.component.html',
  styleUrl: './close-slot.component.scss'
})
export class CloseSlotComponent {

  @Input() message:string;

  @Input() reasons: { 
    value: SlotCloseReason; 
    label: string 
  }[] = [];
  selectedReason: SlotCloseReason;

  constructor(public activeModal:NgbActiveModal){}

}
