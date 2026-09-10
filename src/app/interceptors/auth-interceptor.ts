import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${authService.getToken()}` }
    });
  } else if (authService.getToken()) {
    // Token scaduto rimasto in localStorage: lo ripuliamo per non mandarlo
    // al backend (rifiuterebbe anche le richieste su endpoint pubblici) e
    // per riportare l'app allo stato "non autenticato".
    authService.logoutSync();
  }

  return next(req);
};