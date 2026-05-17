import { Component,Input, OnInit } from '@angular/core';
import { LombardService } from '../../../shared/services/lombard.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-analitycs',
  standalone: true,
  imports: [DecimalPipe,CommonModule,TranslateModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalitycsComponent implements OnInit{

  @Input() pawnshopId: string;

  summary: any;

  constructor(private pawnShopService:LombardService){

  }

    ngOnInit(){
      this.pawnShopService.getSummary(this.pawnshopId).subscribe(summary => {
        this.summary = summary;
      });
    }

}
