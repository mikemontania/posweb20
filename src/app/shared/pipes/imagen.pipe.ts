// ============================================================
//  ImagenPipe — descarga imagen protegida (requiere Bearer)
//  Uso: <img [src]="uuid | imagen : 'usuarios' | async">
// ============================================================
import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '../../core/tokens/app-config.token';

@Pipe({ name: 'imagen', standalone: true, pure: true })
export class ImagenPipe implements PipeTransform {
  private readonly http      = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly config    = inject(APP_CONFIG);

  transform(img: string, tipo: string): Observable<SafeUrl> {
    const url = `${this.config.apiBaseUrl}${tipo}/download-image/${img}`;
    console.log('ImagenPipe: descargando imagen desde', url);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)))
    );
  }
}
