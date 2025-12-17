import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';
import { Product } from '../../../../shared/interfaces/product.interface';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder,Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Status } from '../../../../shared/enums/status.enum';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../../../shared/interfaces/user.interface';

import { Slot } from '../../../../shared/interfaces/slot.interface';
import { Category } from '../../../../shared/enums/category.enum';

import { SlotService } from '../../../../shared/services/slot.service';
import { ProductService } from '../../../../shared/services/product.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { take } from 'rxjs/internal/operators/take';
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

      // Параметры займа
      loanAmount: [null, [Validators.required, Validators.min(100)]],
      interestRate: [null, [Validators.required, Validators.min(0.1)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
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
        status: Status.CLOSED
      }

      const createdProduct = await this.productService.createProduct(productPayload).toPromise();
   
      const slotPayload: Slot = {
        product: createdProduct._id,
        pawnshopId: this.pawnshop._id!,
        userId: this.user._id!,
        loanAmount: this.form.value.loanAmount,
        interestRate: this.form.value.interestRate,
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        status: Status.ACTIVE
      };

      const createdSlot = await this.slotService.createSlot(slotPayload).toPromise();
      window.alert('Слот успешно создан!');

      this.slotCreated.emit(createdSlot);
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

}
