import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-warning-modal',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './warning-modal.component.html',
  styleUrl: './warning-modal.component.scss'
})
export class WarningModalComponent {

}
