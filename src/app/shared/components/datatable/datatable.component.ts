// ============================================================
//  DatatableComponent — Angular 20 standalone
//
//  Componente UX genérico para TODAS las listas del sistema.
//  Cubre: paginación server-side, búsqueda local, columnas
//  configurables, acciones por fila, exportar, estados badge,
//  filas expandibles, loading skeleton, empty state.
//
//  Uso básico:
//    <app-datatable
//      [columns]="cols"
//      [rows]="ventas"
//      [total]="totalElementos"
//      [loading]="cargando"
//      (pageChange)="traerDatos($event)"
//      (rowAction)="onAccion($event)"
//    />
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  signal, computed, ChangeDetectionStrategy, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Tipos públicos ────────────────────────────────────────

/** Definición de una columna */
export interface DtColumn {
  field:      string;           // campo del objeto (ej: 'nroComprobante')
  header:     string;           // título del encabezado
  width?:     string;           // ej: '120px', 'auto'
  align?:     'left' | 'center' | 'right';
  type?:      'text' | 'number' | 'currency' | 'date' | 'datetime'
              | 'badge' | 'boolean' | 'template';
  badgeMap?:  Record<string, 'success' | 'danger' | 'warning' | 'info' | 'neutral'>;
  // ej: { 'SYNC': 'success', 'CANCEL': 'danger', 'WARNING': 'warning' }
  sortable?:  boolean;
  hidden?:    boolean;          // columna oculta en mobile
  format?:    (val: any, row: any) => string;  // formatter custom
}

/** Una acción para el menú de acciones de cada fila */
export interface DtAction {
  id:       string;             // identificador único ('ver', 'editar', 'anular')
  label:    string;
  icon?:    'eye' | 'edit' | 'trash' | 'print' | 'check' | 'x' | 'download';
  color?:   'default' | 'danger' | 'warning' | 'success';
  show?:    (row: any) => boolean;  // condición para mostrar (ej: !row.anulado)
}

/** Evento emitido cuando se hace click en una acción */
export interface DtActionEvent {
  action: string;
  row:    any;
}

/** Evento de cambio de página */
export interface DtPageEvent {
  page:     number;   // 0-indexed
  pageSize: number;
}

/** Evento de ordenamiento */
export interface DtSortEvent {
  field:     string;
  direction: 'asc' | 'desc';
}

// ── Componente ────────────────────────────────────────────

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datatable.component.html',
  styleUrl:    './datatable.component.css',
})
export class DatatableComponent implements OnChanges {

  // ── Inputs ────────────────────────────────────────────
  @Input() columns:      DtColumn[]  = [];
  @Input() rows:         any[]       = [];
  @Input() total:        number      = 0;      // total de registros server-side

  // Signal interno para que filteredRows() sea reactivo con OnPush
  private readonly _rows = signal<any[]>([]);
  @Input() loading:      boolean     = false;
  @Input() pageSize:     number      = 20;
  @Input() set currentPageInput(val: number) {
    // Permite al padre resetear la página (ej: al hacer una nueva búsqueda)
    if (val !== undefined && val !== this.currentPage()) {
      this.currentPage.set(val);
    }
  }
  @Input() pageSizes:    number[]    = [10, 20, 30, 50, 100];
  @Input() actions:      DtAction[]  = [];
  @Input() selectable:   boolean     = false;  // checkboxes de selección
  @Input() expandable:   boolean     = false;  // filas expandibles
  @Input() searchable:   boolean     = true;   // búsqueda local
  @Input() exportable:   boolean     = false;  // botón exportar
  @Input() showFooter:   boolean     = true;   // totales en footer
  @Input() emptyMessage: string      = 'No se encontraron registros';
  @Input() title?:       string;
  @Input() stickyHeader: boolean     = true;

  // ── Outputs ───────────────────────────────────────────
  @Output() pageChange   = new EventEmitter<DtPageEvent>();
  @Output() sortChange   = new EventEmitter<DtSortEvent>();
  @Output() rowAction    = new EventEmitter<DtActionEvent>();
  @Output() rowClick     = new EventEmitter<any>();
  @Output() rowExpand    = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() exportClick  = new EventEmitter<void>();

  // ── Estado interno ─────────────────────────────────────
  readonly currentPage  = signal(0);
  readonly localSearch  = signal('');
  readonly sortField    = signal('');
  readonly sortDir      = signal<'asc' | 'desc'>('asc');
  readonly expandedRows = signal<Set<number>>(new Set());
  readonly selectedRows = signal<Set<any>>(new Set());
  readonly openMenuRow  = signal<number | null>(null);

  // ── Columnas visibles ──────────────────────────────────
  readonly visibleColumns = computed(() =>
    this.columns.filter(c => !c.hidden)
  );

  // ── Filas filtradas localmente ─────────────────────────
  readonly filteredRows = computed(() => {
    const rows = this._rows();
    const q = this.localSearch().trim();
    if (!q) return rows;
    const norm = (s: string) =>
      String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nq = norm(q);
    return rows.filter(row =>
      this.visibleColumns().some(col => norm(String(row[col.field] ?? '')).includes(nq))
    );
  });

  // ── Paginación ─────────────────────────────────────────
  readonly totalPages = computed(() => Math.ceil(this.total / this.pageSize));

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | '...')[] = [];
    if (current <= 3) {
      pages.push(0, 1, 2, 3, 4, '...', total - 1);
    } else if (current >= total - 4) {
      pages.push(0, '...', total - 5, total - 4, total - 3, total - 2, total - 1);
    } else {
      pages.push(0, '...', current - 1, current, current + 1, '...', total - 1);
    }
    return pages;
  });

  readonly pageFrom = computed(() => this.currentPage() * this.pageSize + 1);
  readonly pageTo   = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize, this.total)
  );

  // ── Info de selección ─────────────────────────────────
  readonly selectedCount = computed(() => this.selectedRows().size);
  readonly allSelected   = computed(() => {
    const rows = this._rows();
    return rows.length > 0 && rows.every(r => this.selectedRows().has(r));
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      // Sincronizar al signal interno para que computed() detecte el cambio
      this._rows.set(changes['rows'].currentValue ?? []);
      this.openMenuRow.set(null);
      this.localSearch.set('');
    }
    if (changes['columns']) {
      // Reset al cambiar columnas también
      this.localSearch.set('');
    }
  }

  // ── Paginación ─────────────────────────────────────────
  goToPage(page: number | '...'): void {
    if (page === '...' || page === this.currentPage()) return;
    const p = page as number;
    if (p < 0 || p >= this.totalPages()) return;
    this.currentPage.set(p);
    this.pageChange.emit({ page: p, pageSize: this.pageSize });
  }

  prevPage(): void { if (this.currentPage() > 0) this.goToPage(this.currentPage() - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages() - 1) this.goToPage(this.currentPage() + 1); }

  onPageSizeChange(size: number): void {
    this.currentPage.set(0);
    this.pageSize = +size;
    this.pageChange.emit({ page: 0, pageSize: this.pageSize });
  }

  // ── Ordenamiento ───────────────────────────────────────
  sort(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ field, direction: this.sortDir() });
  }

  // ── Acciones de fila ───────────────────────────────────
  toggleMenu(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuRow.update(v => v === index ? null : index);
  }

  triggerAction(action: DtAction, row: any, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuRow.set(null);
    this.rowAction.emit({ action: action.id, row });
  }

  getVisibleActions(row: any): DtAction[] {
    return this.actions.filter(a => !a.show || a.show(row));
  }

  // ── Expansión de filas ─────────────────────────────────
  toggleExpand(index: number): void {
    this.expandedRows.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
    this.rowExpand.emit(this._rows()[index]);
  }

  isExpanded(index: number): boolean {
    return this.expandedRows().has(index);
  }

  // ── Selección ──────────────────────────────────────────
  toggleSelect(row: any): void {
    this.selectedRows.update(set => {
      const next = new Set(set);
      next.has(row) ? next.delete(row) : next.add(row);
      return next;
    });
    this.selectionChange.emit([...this.selectedRows()]);
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedRows.set(new Set());
    } else {
      this.selectedRows.set(new Set(this._rows()));
    }
    this.selectionChange.emit([...this.selectedRows()]);
  }

  isSelected(row: any): boolean { return this.selectedRows().has(row); }

  // ── Formateo de valores ────────────────────────────────
  formatCell(col: DtColumn, row: any): string {
    const val = row[col.field];
    if (col.format) return col.format(val, row);
    if (val == null || val === '') return '—';

    switch (col.type) {
      case 'currency':
        return 'GS. ' + new Intl.NumberFormat('es-PY', { minimumFractionDigits: 0 }).format(Math.round(+val));
      case 'number':
        return new Intl.NumberFormat('es-PY').format(+val);
      case 'date':
        if (!val) return '—';
        try { return new Date(val).toLocaleDateString('es-PY'); } catch { return val; }
      case 'datetime':
        if (!val) return '—';
        try { return new Date(val).toLocaleString('es-PY'); } catch { return val; }
      case 'boolean':
        return val ? 'Sí' : 'No';
      default:
        return String(val);
    }
  }

  getBadgeVariant(col: DtColumn, row: any): string {
    const val = row[col.field];
    return col.badgeMap?.[val] ?? 'neutral';
  }

  // ── Click en documento para cerrar menús ──────────────
  onDocClick(): void { this.openMenuRow.set(null); }
}
