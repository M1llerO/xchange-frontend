import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/auth.model';

// Il backend restituisce alcuni messaggi in inglese: qui li traduciamo per
// errorCode noti, senza dover aspettare una modifica lato server.
const ERROR_MESSAGES_IT: Record<string, string> = {
  self_offer_not_allowed: "Non puoi fare un'offerta sul tuo stesso annuncio.",
  item_category_not_accepted: 'Uno o più oggetti offerti non rientrano tra le categorie accettate da questo annuncio.',
  concurrent_update: 'Qualcun altro ha modificato questa risorsa nel frattempo: aggiorna la pagina e riprova.',
  conflicting_state: "L'operazione è in conflitto con lo stato attuale dei dati: aggiorna la pagina e riprova.",
  validation_error: 'I dati inseriti non sono validi.',
  malformed_request: 'La richiesta non è valida.',
  invalid_parameter: 'Uno dei parametri inviati non è valido.',
  authentication_failed: 'Credenziali non valide.',
  access_denied: 'Non hai i permessi per compiere questa azione.',
  internal_error: 'Si è verificato un errore interno. Riprova più tardi.'
};

export function extractErrorMessage(err: HttpErrorResponse, fallback = 'Si è verificato un errore, riprova.'): string {
  const body = err.error as Partial<ApiError> | null;
  if (body?.errorCode && ERROR_MESSAGES_IT[body.errorCode]) {
    return ERROR_MESSAGES_IT[body.errorCode];
  }
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  return fallback;
}
