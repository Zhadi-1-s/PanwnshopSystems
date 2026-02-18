import { Component, Input,Output,EventEmitter, OnInit,ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, Validators,FormGroup,FormControl, FormsModule } from '@angular/forms';
import { OfferService } from '../../../../shared/services/offer.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Evaluation } from '../../../../shared/interfaces/offer.interface';
import { EvaluationService } from '../../../../shared/services/evaluation.service';
import { PawnshopTerms } from '../../../../shared/interfaces/pawnshopTerm.interface';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Inject,PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Options} from '@angular-slider/ngx-slider';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CloudinaryService } from '../../../../shared/services/cloudinary.service';
import { finalize,distinctUntilChanged } from 'rxjs';
import { PRODUCT_MODELS } from '../../../../shared/models/product.models';

@Component({
  selector: 'app-evalutaion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslateModule,NgxSliderModule,FormsModule],
  templateUrl: './evalutaion.component.html',
  styleUrl: './evalutaion.component.scss'
})
export class EvalutaionComponent implements OnInit {

  @Input() pawnshopId!: string;
  @Input() userId!: string;
  @Input() term!: PawnshopTerms;
  @Output() closed = new EventEmitter<void>();

  interestResult = 0;
  isBrowser = false;
  manualPrice = false;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;

  sliderMinOptions: Options = {
    floor: 0,
    ceil: 1000000,
    showTicks: false,
    showTicksValues: false,
  };

  form: FormGroup;

  filteredModels: string[] = [];
  models = Object.values(PRODUCT_MODELS).flat();

  constructor(
    private fb: FormBuilder,
    private service: EvaluationService,
    private activeModal:NgbActiveModal,
    private uploadService:CloudinaryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      condition: this.fb.control<'new' | 'good' | 'used' | 'broken'>('good'),
      photos: [[]],
      expectedPrice: [0, Validators.required],
      termDays: [1, Validators.required],
      manualMode: [false],
      userTelephoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^(\+7|7|8)\d{10}$/)
      ]]
    });
    
  }

  get expectedPriceControl() {
    return this.form.get('expectedPrice') as FormControl;
  }

  get manualModeControl() {
    return this.form.get('manualMode') as FormControl;
  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Устанавливаем минимальное количество дней
    this.form.get('termDays')?.setValue(this.term?.minLoanTermDays || 1);

    // Подписка на изменения цены и дней для перерасчета
    this.expectedPriceControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.updateInterest());
    this.form.get('termDays')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.updateInterest());

    this.updateInterest();
  }

  onTitleInput() {
    const value = this.form.get('title')?.value;
    if (!value) {
      this.filteredModels = [];
      return;
    }

    const v = value.toLowerCase();
    this.filteredModels = this.models.filter(m =>
      m.toLowerCase().includes(v)
    ).slice(0, 10); // максимум 10 подсказок
  }

  selectModel(model: string) {
    this.form.get('title')?.setValue(model);
    this.filteredModels = [];
  }

  clearFilteredModels() {
    // небольшая задержка, чтобы mousedown успел сработать
    setTimeout(() => {
      this.filteredModels = [];
    }, 100);
  }

  updateInterest() {
    const price = this.expectedPriceControl.value || 0;

    // Берём дни из формы
    const days = this.form.get('termDays')?.value || 1;

    // Передаём в calculateInterest
    this.interestResult = this.calculateInterest(price, days);
  }


  calculateInterest(price: number, days: number): number {
    if (!this.term) return price;

    const rate = this.term.interest?.rate || 0;

    // Проценты (только дневные)
    const interest = price * (rate / 100) * days;

    // Комиссия
    let fee = 0;
    if (this.term.fees) {
      if (this.term.fees.type === 'fixed') {
        fee = this.term.fees.value;
      } else {
        fee = price * (this.term.fees.value / 100);
      }
    }

    return price + interest + fee;
  }


  async submit() {
    if (this.form.invalid) return;

    this.uploading =true;

    const uploadedUrls: { url: string; publicId: string }[] = [];

    for (const file of this.selectedFiles) {
      try {
        const url = await this.uploadService.uploadImage(file);
        uploadedUrls.push(url);
      } catch (err) {
        console.error('Ошибка загрузки фото:', err);
        this.uploading = false;
      }
    }

    const payload = {
      ...this.form.value,
      photos:uploadedUrls,
      pawnshopId: this.pawnshopId,
      userId: this.userId
    };

    this.service.createEvaluation(payload)
      .pipe(
        finalize(() => {
          this.uploading = false;
        })
      )
      .subscribe({
        next: () => {
          this.activeModal.close(); // ← ЗАКРЫВАЕМ МОДАЛКУ
          this.closed.emit();
        },
        error: (err) => {
          console.error('Ошибка отправки:', err);
        }
      });
    }

  close() {
    this.activeModal.close();
  }

  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    for (const file of Array.from(input.files)) {
      this.selectedFiles.push(file);

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