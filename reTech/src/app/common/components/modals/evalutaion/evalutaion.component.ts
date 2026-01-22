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
    this.form.get('termDays')?.setValue(this.term?.interest?.minChargeDays || 1);

    // Подписка на изменения цены и дней для перерасчета
    this.expectedPriceControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.updateInterest());
    this.form.get('termDays')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.updateInterest());

    this.updateInterest();
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

    // Процент
    const rate = this.term.interest?.rate || 0;
    const period = this.term.interest?.period || 'day';
    const startsAfterDays = this.term.interest?.startsAfterDays || 0;
    const minChargeDays = this.term.interest?.minChargeDays || 0;

    // Кол-во дней для начисления
    const chargeDays = Math.max(days - startsAfterDays, minChargeDays);

    // Рассчитываем процент
    let interest = 0;
    if (chargeDays > 0) {
      interest = price * (rate / 100) * chargeDays;
      // Если процент за месяц, пересчитываем в дни (пример: 30 дней в месяце)
      if (period === 'month') {
        interest = interest * (chargeDays / 30);
      }
    }

    // Комиссия
    let fee = 0;
    if (this.term.fees) {
      if (this.term.fees.type === 'fixed') {
        fee = this.term.fees.value;
      } else if (this.term.fees.type === 'percent') {
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