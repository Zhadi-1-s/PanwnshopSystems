import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-error',
  standalone: true,
  imports: [],
  templateUrl: './login-error.component.html',
  styleUrl: './login-error.component.scss'
})
export class LoginErrorComponent {

  constructor(private router:Router){}

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
