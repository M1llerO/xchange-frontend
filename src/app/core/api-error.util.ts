import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/auth.model';

export function extractErrorMessage(err: HttpErrorResponse, fallback = 'Si è verificato un errore, riprova.'): string {
  const body = err.error as Partial<ApiError> | null;
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  return fallback;
}
