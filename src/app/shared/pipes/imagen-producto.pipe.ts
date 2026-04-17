// ============================================================
//  ImagenProductoPipe — igual a ImagenPipe pero para productos
//  Separados para mantener compatibilidad con el código migrado.
//  Uso: <img [src]="prod.img | imagenProducto : 'productos' | async">
// ============================================================
import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '../../core/tokens/app-config.token';

@Pipe({ name: 'imagenProducto', standalone: true, pure: true })
export class ImagenProductoPipe implements PipeTransform {
  private readonly http      = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly config    = inject(APP_CONFIG);

  transform(img: string, tipo: string): Observable<SafeUrl> {
    const url = `${this.config.apiBaseUrl}${tipo}/download-image/${img}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)))
    );
  }
}
