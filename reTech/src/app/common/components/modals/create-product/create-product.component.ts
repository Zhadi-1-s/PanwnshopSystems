import { CommonModule } from '@angular/common';
import { Component,Input } from '@angular/core';
import { FormBuilder, FormGroup,FormsModule,ReactiveFormsModule,Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../../../shared/services/product.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../../../shared/interfaces/product.interface';
import { Category } from '../../../../shared/enums/category.enum';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule,TranslateModule, FormsModule,ReactiveFormsModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss'
})
export class CreateProductComponent {

  @Input() ownerId!: string;

  productForm : FormGroup;
  uploading = false;

  categories = Object.values(Category);

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private fb:FormBuilder,
    private productService:ProductService,
    public activeModal : NgbActiveModal,
    private uploadService:CloudinaryService
  ){
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      photos: this.fb.control<string[]>([]),
      status: ['active'],
      price: [null, [Validators.required, Validators.min(1)]],
      type: ['sale', Validators.required],
      loanTerm: [null]
    });
    this.productForm.get('type')!.valueChanges.subscribe(type => {
      const loanTermCtrl = this.productForm.get('loanTerm');

      if (type === 'loan') {
        loanTermCtrl?.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
      } else {
        loanTermCtrl?.clearValidators();
        loanTermCtrl?.setValue(null);
      }

      loanTermCtrl?.updateValueAndValidity();
    });
  }

  get title() {
    return this.productForm.get('title')!;
  }

  get category() {
    return this.productForm.get('category')!;
  }

  get price() {
    return this.productForm.get('price');
  }

  async saveProduct() {
    if (this.productForm.invalid) return;

    this.uploading = true;
    const uploadedPhotos: { url: string; publicId: string }[] = [];

    // загружаем фото по очереди в Cloudinary
    for (const file of this.selectedFiles) {
      try {
        const photo = await this.uploadService.uploadImage(file);
        uploadedPhotos.push(photo);
      } catch (err) {
        console.error('Ошибка загрузки фото:', err);
      }
    }

    const product: Product = {
      ...this.productForm.value,
      ownerId: this.ownerId,
      photos: uploadedPhotos,
      status:'active'
    };

   this.productService.createProduct(product).subscribe({
      next: () => this.activeModal.close(true),
      error: err => {
        console.error(err);
        this.uploading = false;
      }
    });
  }

  close() {
    this.activeModal.dismiss();
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
  
  removePhoto(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }


}
