import { Component,Input } from '@angular/core';
import { FormGroup,FormBuilder,Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LombardService } from '../../../../shared/services/lombard.service';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-term',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './create-term.component.html',
  styleUrl: './create-term.component.scss'
})
export class CreateTermComponent {

  @Input() pawnshopId:string

  
  termsForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private pawnshopService: LombardService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCurrentTerms();
  }

  private initForm() {
    this.termsForm = this.fb.group({
      interest: this.fb.group({
        rate: [null, Validators.required],
        period: ['month', Validators.required], // можно выбрать дефолт
        startsAfterDays: [0, Validators.required],
        minChargeDays: [null]
      }),
      limits: this.fb.group({
        maxAmount: [null, Validators.required],
        minAmount: [null]
      }),
      fees: this.fb.group({
        type: ['percent'], // дефолт
        value: [null]
      }),
      priceAdjustmentLimitPercent: [0, Validators.required]
    });
  }

  private loadCurrentTerms() {
    if (!this.pawnshopId) return;
    this.pawnshopService.getLombardById(this.pawnshopId).subscribe({
      next: (pawnshop: PawnshopProfile) => {
        if (pawnshop.terms) {
          this.termsForm.patchValue(pawnshop.terms);
        }
      }
    });
  }

  submit() {
    if (this.termsForm.invalid || !this.pawnshopId) return;

    this.loading = true;

    const updatedData: Partial<PawnshopProfile> = {
      terms: this.termsForm.value
    };

    this.pawnshopService.updateLombard(this.pawnshopId, updatedData).subscribe({
      next: () => {
        this.loading = false;
        alert('Terms updated successfully!');
      },
      error: () => this.loading = false
    });
  }

}
