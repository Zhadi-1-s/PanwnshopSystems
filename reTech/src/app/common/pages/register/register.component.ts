import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule,FormBuilder,Validators  } from '@angular/forms';

import { AuthService } from '../../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterDto } from '../../../shared/interfaces/auth.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  submitted = false;
  registerForm: FormGroup;
  uploading = false;

  avatarPreview: string | ArrayBuffer | null = null;
  avatarFile: File | null = null;
  avatarError: string | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private cloudinary:CloudinaryService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      avarUrl:['']
    });
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    try {
      let logoUrl = this.registerForm.value.logoUrl;

      // Если файл выбран — заливаем его в Cloudinary
      if (this.avatarFile) {
        this.uploading = true;
        logoUrl = await this.cloudinary.uploadImage(this.avatarFile);
        console.log('Uploaded to Cloudinary:', logoUrl);
        this.uploading = false;
      }

      const dto: RegisterDto = {
        ...this.registerForm.value,
        avatarUrl:logoUrl
      };

      this.authService.register(dto).subscribe({
        next: (response) => {
          console.log('Registration success:', response);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration error:', err);
        }
      });
    } catch (err) {
      console.error('Upload failed:', err);
      this.uploading = false;
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.avatarError = 'Please select a valid image file.';
        return;
      }

      this.avatarError = null;
      this.avatarFile = file;

      // Отображаем превью
      const reader = new FileReader();
      reader.onload = e => (this.avatarPreview = e.target?.result);
      reader.readAsDataURL(file);
    }
  }

  loginWithGoogle(): void {
    console.log('Google signup not yet implemented');
  }


  forgotPassword(): void {
    console.log('Forgot password not implemented yet');
  }
}
