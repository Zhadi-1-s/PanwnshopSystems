import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable,PLATFORM_ID } from '@angular/core';
import { catchError, Observable, throwError,switchMap } from 'rxjs';
import { BehaviorSubject,filter,take } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private platformId = inject(PLATFORM_ID);
  private isRefreshing = false;

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http:HttpClient){}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.includes('https://api.cloudinary.com') || request.url.includes('/auth/refresh')) {
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
        if (error.status === 401) {

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.refreshToken().pipe(
              switchMap((res: any) => {
                this.isRefreshing = false;

                localStorage.setItem('access_token', res.accessToken);
                localStorage.setItem('refresh_token', res.refreshToken);

                this.refreshTokenSubject.next(res.accessToken);

                const cloned = this.addToken(request, res.accessToken);
                return next.handle(cloned);
              }),
              catchError((err) => {
                this.isRefreshing = false;
                localStorage.clear();
                return throwError(() => err);
              })
            );

          } else {
            // ⬇️ вот это у тебя сейчас вообще отсутствует
            return this.refreshTokenSubject.pipe(
              filter(token => token != null),
              take(1),
              switchMap(token => {
                const cloned = this.addToken(request, token!);
                return next.handle(cloned);
              })
            );
          }
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

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post(
      `${environment.apiUrl.auth}/refresh`,
      { refreshToken }
    );
  }
}