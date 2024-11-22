import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideToastr({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    }), // Configuração do Toastr
    provideAnimations(), // Necessário para suporte a animações
  ]
}).catch(err => console.error(err));
