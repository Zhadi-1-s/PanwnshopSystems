import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [CommonModule,TranslateModule,ReactiveFormsModule,FormsModule],
  templateUrl: './evaluation-detail.component.html',
  styleUrl: './evaluation-detail.component.scss'
})
export class EvaluationDetailComponent implements OnInit, OnDestroy {

  @Input() evaluationId:string;

  evaluation$:Observable<Evaluation>;

  showCounterOffer = false;

  evaluation : Evaluation;
  user$:User;

  userRole:string;

  loading = false;

  loanInfo: any;

  pawnshop:PawnshopProfile;
  
  priceAdjustmentLimitPercent: number;

  remainingTime: string = '';
  interval: any;

  showApproveInput = false;
  selectedEvaluationId: string | null = null;

  approveAmount: number | null = null;

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

    this.evaluation$ = this.evaluationService.getEvaluationById(this.evaluationId).pipe(
      tap(evaluation => {
        this.evaluation = evaluation;

        this.pawnShopService.getLombardById(evaluation.pawnshopId)
          .subscribe(pawnshop => {
            this.pawnshop = pawnshop;
            this.priceAdjustmentLimitPercent = pawnshop.terms?.priceAdjustmentLimitPercent ?? 10;
            if (evaluation?.expectedPrice && pawnshop?.terms) {
              this.loanCalculation = this.calculateLoan(
                evaluation.expectedPrice,
                evaluation.termDays,
                pawnshop.terms
              );
            }

            this.loading = false;
          });
      })
    );

    this.authService.currentUser$
      .subscribe(user => this.userRole = user.role);

      this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(this.evaluation.expiresAt).getTime();

      const diff = expires - now;

      if (diff <= 0) {
        this.remainingTime = 'Expired';
        clearInterval(this.interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.remainingTime = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private calculateLoan(price: number, termDays: number, terms: PawnshopTerms) {

    const interestRate = terms.interest?.rate ?? 0;
    const maxAmount = terms.limits?.maxAmount ?? Infinity;
    const minAmount = terms.limits?.minAmount ?? 0;

    const fee =
      terms.fees?.type === 'percent'
        ? price * (terms.fees.value / 100)
        : terms.fees?.type === 'fixed'
        ? terms.fees.value
        : 0;

    let loanAmount = Math.min(Math.max(price, minAmount), maxAmount);

    const interestAmount = loanAmount * (interestRate / 100) * (termDays / 30);

    const totalRepayable = loanAmount + interestAmount + fee;

    return {
      loanAmount: Math.round(loanAmount),
      interestAmount: Math.round(interestAmount),
      fee: Math.round(fee),
      totalRepayable: Math.round(totalRepayable),
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

  onActivateDeal(evaluation: any) {
    this.showApproveInput = true;
    this.selectedEvaluationId = evaluation._id;
    this.approveAmount = evaluation.expectedPrice || null; // можно автоподставить
  }

  confirmApprove() {
    if (!this.approveAmount || !this.selectedEvaluationId) return;

    this.loading = true;

    this.evaluationService
      .updateStatus(this.selectedEvaluationId, 'completed', this.approveAmount)
      .subscribe({
        next: res => {
          this.evaluation.status = res.status;
          this.evaluation.approvedAmount = this.approveAmount;

          this.showApproveInput = false;
          this.loading = false;
          this.close();
        },
        error: err => {
          console.error(err.message);
          this.loading = false;
        }
      });
  }

  onRejectDeal(evaluation: any) {
    // логика позже
    this.evaluationService.updateStatus(evaluation._id, 'rejected').subscribe({
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
