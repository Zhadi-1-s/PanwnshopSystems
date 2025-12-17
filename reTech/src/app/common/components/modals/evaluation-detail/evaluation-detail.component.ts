import { Component, Input, OnInit } from '@angular/core';
import { EvaluationService } from '../../../../shared/services/evaluation.service';
import { Evaluation } from '../../../../shared/interfaces/offer.interface';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

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


  constructor(
    private evaluationService:EvaluationService,
    private activeModal:NgbActiveModal
  ){}

  ngOnInit() {
    this.evaluation$ = this.evaluationService.getEvaluationById(this.evaluationId);
  }

  close(){
    this.activeModal.close()
  }

}
