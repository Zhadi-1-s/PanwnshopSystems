import { ApplicationConfig, importProvidersFrom,LOCALE_ID } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideLegacyTranslate } from './translate.config';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';

registerLocaleData(localeRu, 'ru');

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
     provideClientHydration(),
     provideHttpClient(withInterceptorsFromDi()),
     provideLegacyTranslate(),
     {
      provide:HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi:true,
     }, 
     importProvidersFrom(NgbModule),
     {
      provide: LOCALE_ID,
      useValue: 'ru',
     },
     importProvidersFrom(BrowserAnimationsModule),
    ]
};
