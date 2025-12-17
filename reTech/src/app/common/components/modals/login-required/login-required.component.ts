import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login-required',
  standalone: true,
  imports: [],
  templateUrl: './login-required.component.html',
  styleUrl: './login-required.component.scss'
})
export class LoginRequiredComponent {

  constructor(public modal: NgbActiveModal) {}

  close() {
    this.modal.dismiss();
  }

  goToLogin() {
    this.modal.close('login');
  }

}
