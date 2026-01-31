import { Component,Input } from '@angular/core';
import { LombardService } from '../../../../shared/services/lombard.service';
import { FormBuilder,FormGroup,FormsModule,ReactiveFormsModule,Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { ImageViewComponent } from '../../image-view/image-view.component';

export const cities = [
  { code: 'almaty', name: 'Алматы' },
  { code: 'astana', name: 'Астана' },
  { code: 'shymkent', name: 'Шымкент' },
  { code: 'karaganda', name: 'Караганда' },
  {code: 'aktobe', name: 'Актобе'},
  {code: 'pavlodar', name: 'Павлодар'},
  {code: 'uralsk', name: 'Уральск'},
  {code: 'kostanai', name: 'Костанай'},
  {code: 'semei', name: 'Семей'},
  {code: 'taraz', name: 'Тараз'},
  {code: 'atyrau', name: 'Атырау'},
  {code:'qyzylorda', name: 'Кызылорда'},
];



@Component({
  selector: 'app-create-lombard',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './create-lombard.component.html',
  styleUrl: './create-lombard.component.scss'
})
export class CreateLombardComponent {

  @Input() userId!: string; // приходит из login компонента
  lombardForm: FormGroup;
  loading = false;
  errorMessage = '';
  previewLogo: string | null = null;
  selectedLogoFile: File | null = null;
  photos: string[] = [];

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  cities = cities;

  constructor(
      private lombardService:LombardService,
      private fb: FormBuilder,
      private activeModal: NgbActiveModal,
      private uploadService:CloudinaryService
  ){
      this.lombardForm = this.fb.group({
        name: [null, Validators.required],
        logo: [null],
        photos: [[]],
        cityCode: ['', Validators.required],
        address: [null, Validators.required],
        phone: [null, Validators.required],
        slotLimit: [0, Validators.required],
        openTime: ['09:00', Validators.required],
        closeTime: ['18:00', Validators.required],
        description: [''],
        
        terms: this.fb.group({
          interest: this.fb.group({
            rate: [null, Validators.required],
            period: ['month', Validators.required],
            startsAfterDays: [0, Validators.required],
            minChargeDays: [null]
          }),
          limits: this.fb.group({
            maxAmount: [null, Validators.required],
            minAmount: [null]
          }),
          fees: this.fb.group({
            type: ['percent'], // или 'fixed'
            value: [null]
          }),
          priceAdjustmentLimitPercent: [0, Validators.required]
        })
      });

  }

  async submit() {
    if (this.lombardForm.invalid) return;
    this.loading = true;

    try {
      let logo: { url: string; publicId: string } | null = null;

      if (this.selectedLogoFile) {
        logo = await this.uploadService.uploadImage(this.selectedLogoFile);
      }

      const uploadedPhotos: { url: string; publicId: string }[] = [];
      for (const file of this.selectedFiles) {
        try {
          const photo = await this.uploadService.uploadImage(file);
          uploadedPhotos.push(photo);
        } catch (err) {
          console.error('Ошибка загрузки фото:', err);
        }
      }

      const payload: PawnshopProfile = {
        userId: this.userId,
        ...this.lombardForm.value,
        logoUrl: logo?.url || 'assets/png/pawnshopLogo.jpg', 
        photos: uploadedPhotos
      };

      console.log('вот ка выглядит ломбард', payload);

      // ✅ если createLombard возвращает Observable
      this.lombardService.createLombard(payload).subscribe({
        next: (res) => {
          console.log('Ломбард успешно создан:', res);
          this.activeModal.close('created');
        },
        error: (err) => {
          console.error('Ошибка при создании ломбарда:', err);
          this.errorMessage = 'Ошибка при создании ломбарда';
        },
        complete: () => {
          this.loading = false;
        }
      });

    } catch (err) {
      console.error(err);
      this.errorMessage = 'Ошибка при создании ломбарда';
      this.loading = false;
    }
  }


  cancel(){
    this.activeModal.dismiss();
  }
   
  removePhoto(index: number) {
    this.photos.splice(index, 1);
  }

  onLogoSelected(event:any){
    const file = event.target.files?.[0];
    if (file) {
      this.selectedLogoFile = file;

      // превью
      const reader = new FileReader();
      reader.onload = () => (this.previewLogo = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    // добавляем новые фото в массив
    for (const file of Array.from(input.files)) {
      this.selectedFiles.push(file);

      // показываем превью
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrls.push(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

}
