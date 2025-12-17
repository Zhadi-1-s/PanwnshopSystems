import { Component,Input } from '@angular/core';
import { Product } from '../../../../shared/interfaces/product.interface';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../shared/services/product.service';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { ImageViewComponent } from '../../image-view/image-view.component';
import { Status } from '../../../../shared/enums/status.enum';
@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [TranslateModule,ReactiveFormsModule,FormsModule,CommonModule,ImageViewComponent],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss'
})
export class EditProductComponent {
  @Input() product!: Product;

  form!: FormGroup;
  photos: string[] = [];

  status:Status;
  statusValues = Object.values(Status);

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private productService: ProductService,
    private uploadService:CloudinaryService
  ) {}

  ngOnInit() {
    
    this.form = this.fb.group({
      title: [this.product.title, [Validators.required, Validators.minLength(2)]],
      description: [this.product.description || ''],
      category: [this.product.category, Validators.required],
      price: [this.product.price, [Validators.required, Validators.min(0)]],
      status: [this.product.status, Validators.required],
    });
    this.photos = [...(this.product.photos || [])];
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



  removePhoto(index: number) {
    this.photos.splice(index, 1);
  }

  async replacePhoto(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const res: any = await this.uploadService.uploadImage(file);
        this.photos[index] = res.secure_url;
      } catch (err) {
        console.error('Ошибка замены фото', err);
      }
    };
    input.click();
  }


  save() {
    if (this.form.invalid) return;
    const updated: Product = {
      ...this.product,
      ...this.form.value,
      photos:this.photos,
      updatedAt: new Date(),
    };
    this.productService.updateProduct(this.product._id!, updated).subscribe({
    next: (res) => {
      this.activeModal.close(res); // возвращаем обновлённый товар
    },
    error: (err) => {
      console.error('Ошибка при обновлении продукта:', err);
    },
  });
 
  }
}
