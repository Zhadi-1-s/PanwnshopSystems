import { Component, OnInit ,PLATFORM_ID,HostListener} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';

import { inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/interfaces/user.interface';
import { Observable, switchMap,filter,map } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification.service';

import { AppNotification } from '../../../shared/interfaces/notification.interface';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink,CommonModule,DatePipe,TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {

  currentLang = 'en';
  
  isNotificationsOpen = false;

  isPawnShop:boolean = false;

  unreadCount$ : Observable<number>;

  notifications$:Observable<AppNotification[]>
  user$ = this.authService.currentUser$;
  isPawnShop$: Observable<boolean>;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router, 
    private translate: TranslateService,
    private authService:AuthService,
    private notificationService:NotificationService
    ) {
      if(isPlatformBrowser(this.platformId)) {
        const savedLang = localStorage.getItem('lang') || 'en';
        this.translate.use(savedLang);
        this.currentLang = savedLang;
      }
    }

  ngOnInit(): void {
    // Проверяем, есть ли язык в localStorage
    // if(typeof localStorage !== 'undefined') {
    //   const savedLang = localStorage.getItem('lang');
    //   if (savedLang) {
    //     this.currentLang = savedLang;
    //     this.translate.use(savedLang);
    //   } else {
    //     // иначе используем дефолтный
    //     this.translate.setDefaultLang('en');
    //     this.translate.use('en');
    //   }
    // }

    this.notifications$ = this.user$.pipe(
      filter(user => !!user?._id),
      switchMap(user => this.notificationService.getUserNotifications(user!._id))
    );

    this.unreadCount$ = this.user$.pipe(
      filter(user => !!user?._id),
      switchMap(user => this.notificationService.getUnreadCount(user!._id))
    )

    this.isPawnShop$ = this.user$.pipe(
      map(user => user?.role === 'pawnshop')
    );

  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Проверяем, не кликнули ли по кнопке или дропдауну
    if (!target.closest('.position-relative')) {
      this.isNotificationsOpen = false;
    }
  }

  changeLang(lang: string) {
      this.translate.use(lang);
      localStorage.setItem('lang', lang);
      this.currentLang = lang;
    }

  logout() {
    // if(typeof localStorage !== 'undefined'){
    //   localStorage.removeItem('loginToken');
    //   this.router.navigate(['/login']);
    // }
  }
}