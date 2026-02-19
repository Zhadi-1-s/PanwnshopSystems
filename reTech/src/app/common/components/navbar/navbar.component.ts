import { Component,OnInit,PLATFORM_ID,inject ,Output,EventEmitter,HostListener} from '@angular/core';
import { NavItem } from '../../../shared/interfaces/navbar.interface';
import { CommonModule,isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/interfaces/user.interface';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule,TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  
  isLoggedIn: boolean;
  currentLang = 'en';
  user: User | null = null;
 
  sidebarOpen: boolean = true; 
  @Output() sidebarToggled = new EventEmitter<boolean>();

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
    this.sidebarToggled.emit(this.sidebarOpen);
  }
  private platformId = inject(PLATFORM_ID);

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const width = (event.target as Window).innerWidth;

    if (width < 1024 && this.sidebarOpen) {
      this.sidebarOpen = false;
      this.sidebarToggled.emit(false);
    }

    if (width >= 1024 && !this.sidebarOpen) {
      this.sidebarOpen = true;
      this.sidebarToggled.emit(true);
    }
  }

  navItemsUser: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-regular fa-house', route: '/dashboard' },
    { label: 'Lombards', icon: 'fa-regular fa-building', route: '/pawnshop-list' },
    // {label: 'Products', icon: 'fa-solid fa-boxes-stacked', route: '/product-list'},
    { label: 'Help', icon: 'fa-solid fa-circle-question', route: '/calendar' }
  ];

  navItemsPawnshop: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-regular fa-house', route: '/dashboard' },
    { label: 'Products', icon: 'fa-solid fa-boxes-stacked', route: '/product-list' },
    // { label: 'Lombards', icon: 'fa-regular fa-building', route: '/pawnshop-list' },
    { label: 'Help', icon: 'fa-solid fa-circle-question', route: '/calendar' }
  ];

  constructor(
      private authService: AuthService,
      private router: Router,
      private translate:TranslateService)
    {
      if(isPlatformBrowser(this.platformId)) {
              const savedLang = localStorage.getItem('lang') || 'en';
              this.translate.use(savedLang);
              this.currentLang = savedLang;
            }
    }

  searchTerm: string = '';
  filteredItems: NavItem[] = [];
  langOpen: boolean = false;
  isPawnShop:boolean = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;

      if (!user) {
        // Если не авторизован → показываем дефолтное меню
        this.filteredItems = this.navItemsUser;
        return;
      }

      if (user.role === 'pawnshop') {
        this.isPawnShop = true;
        this.filteredItems = this.navItemsPawnshop;
      } else {
        this.isPawnShop = false;
        this.filteredItems = this.navItemsUser;
      }
    });

    if(typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.toggleSidebar()
      console.log(window.innerWidth)
    }

  }


  logout() {
    localStorage.removeItem('access_token');
    this.authService.setCurrentUser(null)
    this.router.navigate(['/login']);
  }

  goToLogin(){
    this.router.navigate(['/login']);
  }
  
   changeLang(lang: string) {
      this.translate.use(lang);
      localStorage.setItem('lang', lang);
      this.currentLang = lang;
    }

}
