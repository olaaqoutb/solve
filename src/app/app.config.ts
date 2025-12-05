import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarConfig,
} from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { loadingInterceptor } from './loading.interceptor';

// Locale support
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { DatePipe, registerLocaleData } from '@angular/common';
import { AuthInterceptorService } from './services/auth-interceptor.service';


registerLocaleData(localeDe, 'de-DE', localeDeExtra);




export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provideHttpClient(withFetch(), withInterceptors([loadingInterceptor])),
    provideHttpClient(withInterceptorsFromDi()),
        { provide: 'BASE_URL', useValue: 'http://localhost:8080/api' }, // Your API URL


    {
      provide:HTTP_INTERCEPTORS,
      useClass:AuthInterceptorService,
      multi:true
    },

    provideAnimations(),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      } as MatSnackBarConfig,
    },
    { provide: LOCALE_ID, useValue: 'de-DE' },

    DatePipe
  ],
};
