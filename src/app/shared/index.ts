// ============================================================
//  Shared — Barrel de exportaciones
//  Importar desde: import { SelectSearchComponent } from '@shared'
//  (requiere path alias @shared/* en tsconfig.json)
// ============================================================

// ── Componentes ───────────────────────────────────────────
export * from './components/select-search/select-search.component';
export * from './components/chart-bar/chart-bar.component';
export * from './components/chart-pie/chart-pie.component';
export * from './components/chart-line/chart-line.component';
export * from './components/modal-confirm/modal-confirm.component';
export * from './components/incrementador/incrementador.component';
export * from './components/toast/toast.service';

// ── Directivas ────────────────────────────────────────────
export * from './directives/debounce-input.directive';
export * from './directives/input-mask.directive';

// ── Pipes ─────────────────────────────────────────────────
export * from './pipes/search.pipe';
export * from './pipes/imagen.pipe';
export * from './pipes/imagen-producto.pipe';

// ── Re-export tipos públicos ──────────────────────────────
export type { MapMarker } from './components/mapa/mapa.component';

// ── Datatable ─────────────────────────────────────────────
export * from './components/datatable/datatable.component';
export type { DtColumn, DtAction, DtActionEvent, DtPageEvent, DtSortEvent } from './components/datatable/datatable.component';
