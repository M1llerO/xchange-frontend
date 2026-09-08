import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Un 401 su una chiamata pubblica (nessun token inviato) non deve
        // buttare fuori un visitatore non loggato dalla pagina che sta guardando:
        // deve solo far fallire quella chiamata. Il redirect al login ha senso
        // solo se la sessione era attiva ed e' scaduta/non valida.
        const hadToken = !!authService.getToken();
        authService.logoutSync();
        if (hadToken) {
          router.navigate(['/login']);
        }
      }
      if (err.status === 403) {
        router.navigate(['/forbidden']);
      }
      return throwError(() => err);
    })
  );
};