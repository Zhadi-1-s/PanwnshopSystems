import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { filter,map,take,Observable,of} from 'rxjs';
import {inject} from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private router = inject(Router);



  canActivate(): boolean | UrlTree {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        return true; // если токен есть — просто пускаем
      }
    }

    // если токена нет — редиректим
    return this.router.createUrlTree(['/login']);
  }

}
