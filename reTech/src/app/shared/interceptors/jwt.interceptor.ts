import { isPlatformBrowser } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable,PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
 
  private platformId= inject(PLATFORM_ID);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.includes('https://api.cloudinary.com')) {
      return next.handle(request);
    }

    if(isPlatformBrowser(this.platformId)) {

      let token = localStorage.getItem('access_token');
  
      if(token) {
        request = request.clone({
          setHeaders:{
            Authorization: `Bearer ${token}`
          }
        })
      }
    }
    return next.handle(request);

  }

}
