import { Component,OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FormBuilder, FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,TranslateModule],
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.scss'
})
export class CreatePasswordComponent implements OnInit{

  newPasswordForm!: FormGroup;
  submitted = false;
  token!: string;

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private authService:AuthService,
    private fb:FormBuilder){

  }

  ngOnInit(): void {
       this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
       this.newPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }


  onSubmit(): void {
    this.submitted = true;
    if (this.newPasswordForm.invalid) return;

    const newPassword = this.newPasswordForm.value.password;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        alert('Password successfully changed!');
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Reset error:', err)
    });
  }

  goToLogin(){}

}
