import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { APP_CONFIG } from '../../tokens/app-config.token';
import { Canal } from '../../models/domain/canal.model';

@Injectable({ providedIn: 'root' })
export class CanalService {
  private readonly http   = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base   = () => `${this.config.apiBaseUrl}canales`;

  getAll(params?: Record<string, string | number>): Observable<Canal[]> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => p = p.set(k, String(v)));
    return this.http.get<Canal[]>(this.base(), { params: p }).pipe(
      catchError(e => throwError(() => e))
    );
  }

  getCanalPrincipal(): Observable<any> {
    return this.http.get<any>(`${this.base()}/principal`).pipe(
      catchError(e => throwError(() => e))
    );
  }

}
