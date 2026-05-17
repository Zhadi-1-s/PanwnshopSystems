import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../../../shared/services/auth.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  resetForm: FormGroup;
  submitted = false;

  constructor(
        private activeModal: NgbActiveModal,
        private fb: FormBuilder,
        private authService: AuthService) 
        {
        this.resetForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
        });
  }

   onSubmit(): void {
    this.submitted = true;
    if (this.resetForm.invalid) return;

    const email = this.resetForm.value.email;
    this.authService.resetPasswordRequest(email).subscribe({
      next: () => {
        alert('Reset link sent to your email!');
        this.activeModal.close();
      },
      error: (err) => console.error('Reset error:', err)
    });
  }

  close(){
    this.activeModal.dismiss();
  }

}
