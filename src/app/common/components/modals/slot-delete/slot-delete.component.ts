import { Component,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-slot-delete',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './slot-delete.component.html',
  styleUrl: './slot-delete.component.scss'
})
export class SlotDeleteComponent {

  @Input() slotId!: string;

  constructor(public activeModal:NgbActiveModal){}

  confirm() {
    this.activeModal.close('confirm');
  }

  cancel() {
    this.activeModal.dismiss();
  }

}
