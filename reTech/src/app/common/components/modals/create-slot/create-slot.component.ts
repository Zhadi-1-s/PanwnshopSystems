import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { Product } from '../../../../shared/interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder,Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoanStatus, ProductStatus, Status } from '../../../../shared/enums/status.enum';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../../../shared/interfaces/user.interface';

import { Slot } from '../../../../shared/interfaces/slot.interface';
import { Category } from '../../../../shared/enums/category.enum';

import { SlotService } from '../../../../shared/services/slot.service';
import { ProductService } from '../../../../shared/services/product.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { take } from 'rxjs/internal/operators/take';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-create-slot',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,TranslateModule],
  templateUrl: './create-slot.component.html',
  styleUrl: './create-slot.component.scss'
})
export class CreateSlotComponent implements OnInit {

  @Input() pawnshop : PawnshopProfile | null;

  @Output() slotCreated = new EventEmitter<Slot>();

  user:User | null;

  status = Status;

  form: FormGroup;

  showSuccess = false;
  createdSlot: any;

  categories = Object.values(Category);
  loading = false;
  errorMessage = '';

  users$ = this.userService.currentUser$;

  constructor(
    private fb: FormBuilder,
     public activeModal: NgbActiveModal,
     private slotService: SlotService,
     private productService:ProductService,
     private userService:AuthService
  ){
    this.form = this.fb.group({
      // Информация о товаре
      title: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      photos: [[]],
      telephone: ['', [
          Validators.required,
          Validators.pattern(/^\+7\d{10}$/)
        ]],
      // Параметры займа
      loanAmount: [null, [Validators.required, Validators.min(100)]],
      interestRate: [null, [Validators.required, Validators.min(0.1)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      prolongationAllowed: [false] 
    });
  }

  ngOnInit(): void {
    //   this.slotForm = this.fb.group({
    //   loanAmount: [null, [Validators.required, Validators.min(100)]],
    //   interestRate: [null, [Validators.required, Validators.min(0.1)]],
    //   startDate: [null, Validators.required],
    //   endDate: [null, Validators.required],
    //   status: [Status.ACTIVE, Validators.required]
    // });
    this.users$.pipe(take(1)).subscribe(user => {
      this.user = user;
    });

    console.log('CreateSlotComponent initialized with pawnshop:', this.pawnshop, 'and user:', this.user);
  }

  async onSubmit():Promise<void> {

    console.log('Form submitted with values:', this.form.value);

    console.log('the button for create is clicked')

    if (this.form.invalid || !this.pawnshop || !this.user) return;

    this.loading = true;
    this.errorMessage = '';

    try { 
      const productPayload:Product = {
        ownerId: this.user._id!,
        title: this.form.value.title,
        description: this.form.value.description,
        category: this.form.value.category,
        photos: this.form.value.photos || [],
        price: 0,
        status: ProductStatus.IN_LOAN,
        type:'loan',
        loanTerm: Math.ceil((new Date(this.form.value.endDate).getTime() - new Date(this.form.value.startDate).getTime()) / (1000 * 60 * 60 * 24)),
      }

      const createdProduct = await firstValueFrom(
        this.productService.createProduct(productPayload)
      );
   
      const slotPayload: Slot = {
        product: createdProduct._id,
        pawnshopId: this.pawnshop._id!,
        userId: this.user._id!,
        loanAmount: this.form.value.loanAmount,
        interestRate: this.form.value.interestRate,
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        status: LoanStatus.ACTIVE,
        telephone:this.form.value.telephone
      };

      const createdSlot = await firstValueFrom(
        this.slotService.createSlot(slotPayload)
      );
      this.createdSlot = createdSlot;
      this.showSuccess = true;
      this.form.reset();
    } catch (err) {
      this.errorMessage = 'Ошибка при создании слота';
    } finally {
      this.loading = false;
     
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  getSlotLink(): string {
    return `${window.location.origin}/slot/${this.createdSlot?._id}`;
  }

  copyLink() {
    const link = this.getSlotLink();

    navigator.clipboard.writeText(link).then(() => {
      console.log('Ссылка скопирована');
    });
  }

  getWhatsAppLink(): string {

    console.log('RAW phone:', this.createdSlot?.telephone);
    console.log('FORMATTED phone:', this.formatPhone(this.createdSlot?.telephone));

    const phone = this.formatPhone(this.createdSlot?.telephone);

    return `https://api.whatsapp.com/send?phone=${phone}`;
  }

  formatPhone(phone: string): string {
    if (!phone) return '';

    // убираем всё кроме цифр
    let clean = phone.replace(/\D/g, '');

    // если номер без кода страны — добавь (например Казахстан +7)
    if (clean.length === 10) {
      clean = '7' + clean;
    }

    return clean;
  }

  closeModal(){
    this.showSuccess = false;
    this.activeModal.close();
  }

}
