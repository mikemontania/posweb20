// ============================================================
//  SelectSearchComponent — selector con búsqueda paginada
//  API compatible con ng-select:
//    bindLabel, bindValue, (changed)   ← dashboard / lista simple
//    labelField, keyField, (selectedChange), (search)  ← forms
//
//  Uso dashboard:
//    <app-select-search [items]="sucursales()" bindLabel="nombreSucursal"
//      placeholder="Todas" (changed)="onSuc($event)"/>
//
//  Uso form con búsqueda al backend:
//    <app-select-search [items]="listasPrecios()" labelField="descripcion"
//      keyField="codListaPrecio" [selected]="selLP()"
//      (selectedChange)="selLP.set($event)" (search)="searchLP$.next($event)"/>
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  signal, ChangeDetectionStrategy, HostListener,
  ElementRef, inject, OnChanges, SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-select-search',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ss-wrapper" [class.ss-open]="isOpen()">

      <!-- ── Trigger ─────────────────────────────── -->
      <div class="ss-trigger" (click)="toggle()" [class.ss-has-value]="!!selected" [class.ss-disabled]="disabled">
        <span class="ss-value">
          @if (selected) {
            {{ getLabel(selected) }}
          } @else {
            <span class="ss-placeholder">{{ placeholder }}</span>
          }
        </span>
        @if (selected) {
          <button class="ss-clear" type="button" (click)="clear($event)" title="Limpiar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        } @else {
          <svg class="ss-arrow" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        }
      </div>

      <!-- ── Dropdown ─────────────────────────────── -->
      @if (isOpen()) {
        <div class="ss-dropdown">
          <div class="ss-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input #searchInp
              class="ss-search-input"
              type="text"
              [placeholder]="'Buscar ' + placeholder.toLowerCase() + '...'"
              [value]="query()"
              (input)="onInput($event)"
              (keydown.escape)="close()"
            />
          </div>
          <div class="ss-list">
            @if (isSearching()) {
              <div class="ss-state">
                <span class="ss-spinner"></span> Buscando...
              </div>
            }
            @if (!isSearching() && filteredItems().length === 0) {
              <div class="ss-state">Sin resultados</div>
            }
            @for (item of filteredItems(); track getKey(item)) {
              <div class="ss-option"
                   [class.ss-selected]="isSelected(item)"
                   (click)="selectItem(item)">
                <span>{{ getLabel(item) }}</span>
                @if (isSelected(item)) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .ss-wrapper { position: relative; width: 100%; user-select: none; }

    /* ── Trigger (campo cerrado) ─────────────── */
    .ss-trigger {
      display: flex; align-items: center; gap: .5rem;
      min-height: 38px; padding: .4rem .75rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      cursor: pointer;
      transition: border-color 150ms, box-shadow 150ms;
    }
    .ss-trigger:hover {
      border-color: color-mix(in srgb, var(--border-color) 30%, var(--color-accent));
    }
    .ss-open .ss-trigger {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
    }
    .ss-value {
      flex: 1; font-size: .8125rem; color: var(--text-primary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-weight: 400;
    }
    .ss-has-value .ss-value { font-weight: 500; }
    .ss-placeholder { color: var(--text-muted); font-weight: 400; }
    .ss-arrow {
      color: var(--text-muted); flex-shrink: 0;
      transition: transform 200ms;
    }
    .ss-open .ss-arrow { transform: rotate(180deg); }
    .ss-clear {
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; padding: 0;
      background: transparent; border: none; border-radius: 50%;
      cursor: pointer; color: var(--text-muted); transition: all 120ms;
    }
    .ss-clear:hover {
      background: var(--status-danger-bg); color: var(--status-danger-text);
    }

    .ss-disabled { opacity: .55; cursor: not-allowed; pointer-events: none; }

    /* ── Dropdown ─────────────────────────────── */
    .ss-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 9999;
      background: var(--bg-surface);
      border: 1.5px solid var(--color-accent);
      border-top: none;
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      box-shadow: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
      overflow: hidden;
      animation: ss-open 130ms cubic-bezier(0,0,.2,1);
    }
    @keyframes ss-open {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Buscador dentro del dropdown ─────────── */
    .ss-search-wrap {
      display: flex; align-items: center; gap: .5rem;
      padding: .5rem .875rem;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-surface-2);
      color: var(--text-muted);
    }
    .ss-search-input {
      flex: 1; border: none; background: transparent; outline: none;
      font-size: .8125rem; color: var(--text-primary);
    }
    .ss-search-input::placeholder { color: var(--text-muted); font-style: italic; }

    /* ── Lista de opciones ───────────────────── */
    .ss-list { max-height: 230px; overflow-y: auto; padding: .25rem 0; }
    .ss-option {
      display: flex; align-items: center; justify-content: space-between;
      padding: .55rem 1rem;
      font-size: .8125rem; font-weight: 400;
      cursor: pointer; color: var(--text-primary);
      border-radius: 0;
      transition: background 80ms;
    }
    .ss-option:hover {
      background: color-mix(in srgb, var(--color-accent) 6%, var(--bg-surface-2));
    }
    .ss-selected {
      background: var(--color-accent-light);
      color: var(--color-accent);
      font-weight: 600;
    }
    .ss-selected:hover {
      background: color-mix(in srgb, var(--color-accent) 14%, transparent);
    }

    /* ── Estados ─────────────────────────────── */
    .ss-state {
      display: flex; align-items: center; gap: .5rem;
      justify-content: center;
      padding: 1rem; font-size: .8125rem; color: var(--text-muted);
    }
    .ss-spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid var(--border-color);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: ss-spin .65s linear infinite;
    }
    @keyframes ss-spin { to { transform: rotate(360deg); } }
  `]
})
export class SelectSearchComponent implements OnChanges {
  // ── API ng-select compatible ───────────────────────────
  @Input() bindLabel = '';          // ej: 'nombreSucursal'
  @Input() bindValue = '';          // ej: 'codSucursal' (si se quiere emitir solo el valor)

  // ── API extendida ──────────────────────────────────────
  @Input() set labelField(v: string) { if (v) this.bindLabel = v; }
  @Input() set keyField(v: string)   { if (v) this.bindValue = v; }

  @Input() items:       any[]  = [];
  @Input() placeholder         = 'Seleccione...';
  @Input() selected:    any    = null;    // objeto completo seleccionado
  @Input() loading             = false;   // spinner externo (bool o signal)
  @Input() disabled            = false;   // deshabilita interacción

  // ── Eventos ─────────────────────────────────────────────
  /** Emite el OBJETO completo (o null). API ng-select: (changed) */
  @Output() changed        = new EventEmitter<any>();
  /** Alias de changed para API nueva: (selectedChange) */
  @Output() selectedChange = new EventEmitter<any>();
  /** Emite el string de búsqueda: (search) */
  @Output() search         = new EventEmitter<string>();

  isOpen     = signal(false);
  query      = signal('');
  isSearching = signal(false);

  // Lista filtrada localmente cuando no hay búsqueda remota
  filteredItems = signal<any[]>([]);

  private readonly el       = inject(ElementRef);
  private readonly search$  = new Subject<string>();

  constructor() {
    // Búsqueda con debounce — emite al padre para que haga getAll
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(q => {
      this.search.emit(q);
      // Filtro local mientras esperamos (si items ya cargados)
      this._filterLocal(q);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando llegan items nuevos, actualizar filteredItems
    if (changes['items']) {
      this._filterLocal(this.query());
    }
  }

  @HostListener('document:click', ['$event'])
  onOutside(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) this.close();
  }

  toggle(): void { if (this.disabled) return; this.isOpen() ? this.close() : this.open(); }

  open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this._filterLocal('');
    setTimeout(() => {
      this.el.nativeElement.querySelector('.ss-search-input')?.focus();
    }, 30);
  }

  close(): void { this.isOpen.set(false); }

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.query.set(val);
    this.search$.next(val);
  }

  selectItem(item: any): void {
    this.changed.emit(item);
    this.selectedChange.emit(item);
    this.close();
  }

  clear(e: MouseEvent): void {
    e.stopPropagation();
    this.changed.emit(null);
    this.selectedChange.emit(null);
  }

  // ── Helpers ────────────────────────────────────────────
  getLabel(item: any): string {
    if (!item) return '';
    const field = this.bindLabel || 'descripcion';
    if (field.includes('|')) {
      return field.split('|').map(f => item[f.trim()] ?? '').filter(Boolean).join(' — ');
    }
    return item[field] ?? '';
  }

  getKey(item: any): any {
    const field = this.bindValue || this.bindLabel || 'id';
    return item?.[field] ?? JSON.stringify(item);
  }

  isSelected(item: any): boolean {
    if (!this.selected) return false;
    // Comparar por clave si bindValue está definido
    if (this.bindValue) {
      return item?.[this.bindValue] === this.selected?.[this.bindValue]
          || item?.[this.bindValue] === this.selected;
    }
    return JSON.stringify(item) === JSON.stringify(this.selected);
  }

  private _filterLocal(q: string): void {
    if (!q.trim()) {
      this.filteredItems.set(this.items);
      return;
    }
    const lower = q.toLowerCase();
    this.filteredItems.set(
      this.items.filter(i => JSON.stringify(i).toLowerCase().includes(lower))
    );
  }
}
