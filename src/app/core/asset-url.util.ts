import { environment } from '../../environments/environment';

/**
 * Origine del backend, ricavata da environment.apiUrl togliendo il suffisso "/api".
 * Es. "http://localhost:8080/api" -> "http://localhost:8080".
 */
const backendOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

/**
 * Trasforma il path pubblico restituito dal backend (es. "/files/items/5/foo.jpg")
 * in un URL assoluto verso il backend. Gli URL gia' assoluti vengono lasciati invariati.
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
}
