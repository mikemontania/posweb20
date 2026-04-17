// ============================================================
//  HTTP Helpers — utilidades para customizar requests
//
//  Uso en servicios:
//    // Request con timeout extendido (uploads, reportes)
//    this.http.post(url, data, withTimeout(120_000))
//
//    // Request sin timeout (streaming largo)
//    this.http.get(url, withTimeout(0))
//
//    // Request silenciosa (sin spinner ni toast de timeout)
//    this.http.get(url, silent())
// ============================================================
import { HttpHeaders, HttpContext } from '@angular/common/http';

/** Sobrescribe el timeout para una request específica */
export function withTimeout(ms: number): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({ 'X-Timeout': String(ms) }),
  };
}

/** Marca la request como silenciosa (sin spinner, sin toast de timeout) */
export function silent(): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({ 'X-Silent': '1' }),
  };
}

/** Combina timeout extendido + silencioso */
export function withTimeoutSilent(ms: number): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({
      'X-Timeout': String(ms),
      'X-Silent':  '1',
    }),
  };
}
