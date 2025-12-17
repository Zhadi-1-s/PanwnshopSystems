import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PawnshopProfile } from '../../../shared/interfaces/shop-profile.interface';
import { CommonModule } from '@angular/common';
import { LombardService } from '../../../shared/services/lombard.service';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../../shared/services/auth.service';
import { NgbSlide } from "../../../../../node_modules/@ng-bootstrap/ng-bootstrap/carousel/carousel";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{

  lombardList:PawnshopProfile[];

  user$ = this.authService.currentUser$;

  constructor(
              private lombardService:LombardService,
              private authService:AuthService
  ){}

  ngOnInit(){
      this.lombardService.getLombards().subscribe({
        next : (pawnshops) => {
          this.lombardList = pawnshops;
          console.log('this is the pawnshops list');
        },
        error(err) {
            console.error(err.message)
        },
      })
  }

  scrollToPawnshops() {
    const el = document.getElementById('Pawnshops');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToHowItWorks() {
    const el = document.getElementById('HowItWorks');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  mobileMenuOpen: boolean = false;

}
