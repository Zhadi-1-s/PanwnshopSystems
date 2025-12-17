import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../shared/interfaces/user.interface';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../../../shared/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule,FormsModule,TranslateModule],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.scss'
})
export class EditModalComponent {

  @Input() user: User; // получаем данные из родительского компонента
  editedUser: User;

  uploading = false;
  avatarPreview: string | ArrayBuffer | null = null;


  constructor(
    public activeModal: NgbActiveModal, 
    private authService: AuthService,
    private uploadService:CloudinaryService
  ) {

  }

  ngOnInit(): void {
    // копируем данные, чтобы не редактировать оригинальный объект
    this.editedUser = { ...this.user };
    this.avatarPreview = this.user.avatarUrl || '/assets/png/default-avatar.jpg'
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    this.uploading = true;

    try {
      const uploadedUrl = await this.uploadService.uploadImage(file);
      this.editedUser.avatarUrl = uploadedUrl;
      this.avatarPreview = uploadedUrl;
    } catch (err) {
      console.error('Ошибка загрузки изображения:', err);
      alert('Ошибка при загрузке изображения');
    } finally {
      this.uploading = false;
    }
  }


  saveChanges(): void {
    this.authService.updateUser(this.editedUser).subscribe({
      next: (updatedUser) => {
        this.activeModal.close(updatedUser);
      },
      error: (err) => {
        console.error('Ошибка при сохранении пользователя:', err);
        alert('Не удалось сохранить изменения');
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

}
