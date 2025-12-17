import { Component,Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../shared/interfaces/user.interface';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { LombardService } from '../../../../shared/services/lombard.service';
import { TranslateModule } from '@ngx-translate/core';
import { ImageViewComponent } from '../../image-view/image-view.component';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';

@Component({
  selector: 'app-edit-lombard',
  standalone: true,
  imports: [CommonModule,FormsModule,TranslateModule,ImageViewComponent],
  templateUrl: './edit-lombard.component.html',
  styleUrl: './edit-lombard.component.scss'
})
export class EditLombardComponent implements OnInit {

  @Input() lombard: PawnshopProfile;

  editedShop:PawnshopProfile;
  photos: string[] = [];

  constructor(
    private modalService:NgbActiveModal,
    private lombardService:LombardService,
    private uploadService:CloudinaryService
  ){

  }

  ngOnInit(){
    this.editedShop = {...this.lombard};
    this.photos = this.editedShop.photos ? [...this.editedShop.photos] : [];
  }

  async onFileSelect(): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const url = await this.uploadService.uploadImage(file);
        this.photos.push(url);
        console.log('🌐 Ответ от Cloudinary:', url);
      } catch (err) {
        console.error('Ошибка загрузки фото:', err);
      }
    };

    input.click();
  }
  
  removePhoto(index: number): void {
    this.photos.splice(index, 1);
  }

  saveChanges(): void {
    this.editedShop.photos = [...this.photos];

    this.lombardService
      .updateLombard(this.editedShop._id, this.editedShop)
      .subscribe((updatedData) => {
        this.editedShop = updatedData;
        this.modalService.close(this.editedShop);
      });
  }

  cancel(): void {
    this.modalService.dismiss();
  }

}
