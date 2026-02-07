import { Component, Input, OnInit } from '@angular/core';
import { EvaluationService } from '../../../../shared/services/evaluation.service';
import { Evaluation } from '../../../../shared/interfaces/offer.interface';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/interfaces/user.interface';
import { AuthService } from '../../../../shared/services/auth.service';

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

  constructor(
    private evaluationService:EvaluationService,
    private activeModal:NgbActiveModal,
    private authService:AuthService,
  ){}

  ngOnInit() {
    this.evaluation$ = this.evaluationService.getEvaluationById(this.evaluationId).pipe(
     tap( evaluation => this.evaluation = evaluation)
    );
    this.authService.currentUser$.pipe(
      tap(user => this.userRole = user.role)
    ).subscribe()
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
