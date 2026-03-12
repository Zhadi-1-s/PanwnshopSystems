import { Component, Input, OnInit } from '@angular/core';
import { EvaluationService } from '../../../../shared/services/evaluation.service';
import { Evaluation } from '../../../../shared/interfaces/offer.interface';
import { Observable, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/interfaces/user.interface';
import { AuthService } from '../../../../shared/services/auth.service';
import { LombardService } from '../../../../shared/services/lombard.service';
import { PawnshopTerms } from '../../../../shared/interfaces/pawnshopTerm.interface';
import { PawnshopProfile } from '../../../../shared/interfaces/shop-profile.interface';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './evaluation-detail.component.html',
  styleUrl: './evaluation-detail.component.scss'
})
export class EvaluationDetailComponent implements OnInit {

  @Input() evaluationId:string;

  evaluation$:Observable<Evaluation>;

  showCounterOffer = false;

  evaluation : Evaluation;
  user$:User;

  userRole:string;

  loading = false;

  pawnshop:PawnshopProfile;
  
  loanCalculation: {
    loanAmount: number;
    interestAmount: number;
    fee: number;
    totalRepayable: number;
    termDays: number;
    prolongationAllowed: boolean;
    lateFeePercent: number;
  };

  constructor(
    private evaluationService:EvaluationService,
    private activeModal:NgbActiveModal,
    private authService:AuthService,
    private pawnShopService:LombardService
  ){}

  ngOnInit() {
    this.loading = true;

    // Поток для evaluation
    this.evaluation$ = this.evaluationService.getEvaluationById(this.evaluationId).pipe(
      tap(evaluation => this.evaluation = evaluation)
    );

    // Поток для pawnshop и расчёта займа
    this.evaluation$.pipe(
      switchMap(evaluation => this.pawnShopService.getLombardById(evaluation.pawnshopId)),
      tap(pawnshop => {
        this.pawnshop = pawnshop;
        console.log(pawnshop, 'pawnshop for evaluation');

        if (this.evaluation && this.pawnshop?.terms) {
          this.loanCalculation = this.calculateLoan(
            this.evaluation.expectedPrice,
            this.evaluation.termDays,
            this.pawnshop.terms
          );
          console.log(this.loanCalculation, 'loan calculation');
        }

        this.loading = false;
      })
    ).subscribe();

    // Текущий пользователь
    this.authService.currentUser$.pipe(
      tap(user => this.userRole = user.role)
    ).subscribe();
  }

  private calculateLoan(price: number, termDays: number, terms: PawnshopTerms) {
    const interestRate = terms.interest?.rate ?? 0; // ставка %
    const maxAmount = terms.limits?.maxAmount ?? Infinity;
    const minAmount = terms.limits?.minAmount ?? 0;
    const fee = terms.fees?.type === 'percent' ? price * (terms.fees.value / 100) :
                terms.fees?.type === 'fixed' ? terms.fees.value : 0;

    // Корректируем сумму займа с учётом max/min
    let loanAmount = Math.min(Math.max(price, minAmount), maxAmount);

    // Применяем проценты по ставке
    const interestAmount = loanAmount * (interestRate / 100) * (termDays / 30); // примерно месячный расчёт

    // Итоговая сумма к возврату
    const totalRepayable = loanAmount + interestAmount + fee;

    return {
      loanAmount,
      interestAmount,
      fee,
      totalRepayable,
      termDays,
      prolongationAllowed: terms.prolongationAllowed ?? false,
      lateFeePercent: terms.lateFeePercent ?? 0
    };
  }

  close(){
    this.activeModal.close()
  }

  rejectEvaluation(id:string){

    this.loading = true; 

    this.evaluationService.updateStatus(id,'rejected').subscribe(
      next => {
        this.evaluation.status = next.status;
        this.loading = false;
        this.close()
      },
      error => {
        console.error(error.message);
         this.loading = false;
      }
    )
  }

  acceptEvaluation(id: string) {
    this.loading = true;

    this.evaluationService.updateStatus(id, 'in_inspection').subscribe({
      next: res => {
        this.evaluation.status = res.status;
        this.loading = false;
        this.close();
      },
      error: err => {
        console.error(err.message);
        this.loading = false;
      }
    });
  }

}
