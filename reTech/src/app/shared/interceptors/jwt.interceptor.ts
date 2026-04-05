import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable,PLATFORM_ID } from '@angular/core';
import { catchError, Observable, throwError,switchMap } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private platformId = inject(PLATFORM_ID);
  private isRefreshing = false;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.includes('https://api.cloudinary.com')) {
      return next.handle(request);
    }

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');

      if (token) {
        request = this.addToken(request, token);
      }
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;

          return this.refreshToken().pipe(
            switchMap((res: any) => {
              this.isRefreshing = false;

              localStorage.setItem('access_token', res.accessToken);
              localStorage.setItem('refresh_token', res.refreshToken);

              const cloned = this.addToken(request, res.accessToken);

              return next.handle(cloned);
            }),
            catchError((err) => {
              this.isRefreshing = false;
              // если refresh тоже умер → логин заново
              localStorage.clear();
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');

    return inject(HttpClient).post('/auth/refresh', {
      refreshToken
    });
  }
}