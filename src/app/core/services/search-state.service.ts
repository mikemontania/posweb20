import { Injectable } from '@angular/core';

/**
 * Guarda el estado de búsqueda de los listados para restaurarlo
 * cuando el usuario vuelve de una página de detalle.
 *
 * Uso:
 *   // guardar (en buscar())
 *   this.stateSvc.save('ventas-lista', { fechaDesde, fechaHasta, ... , page });
 *
 *   // restaurar (en ngOnInit)
 *   const s = this.stateSvc.get('ventas-lista');
 *   if (s) { this.fechaDesde.set(s.fechaDesde); ... this.buscar(s.page); }
 *   else    { this.buscar(); }
 */
@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private readonly _store = new Map<string, any>();

  save(key: string, state: any): void {
    this._store.set(key, state);
  }

  get<T = any>(key: string): T | null {
    return this._store.get(key) ?? null;
  }

  clear(key: string): void {
    this._store.delete(key);
  }
}
