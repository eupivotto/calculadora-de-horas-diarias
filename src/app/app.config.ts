import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(),
              provideZoneChangeDetection({ eventCoalescing: true }),
              provideRouter(routes), provideClientHydration(),
              provideToastr({ positionClass: 'toast-bottom-right', preventDuplicates: true

              })]
};
