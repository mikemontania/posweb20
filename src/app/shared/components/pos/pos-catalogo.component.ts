// pos-catalogo — grilla/lista de productos con búsqueda, toggle vista, cantidad y filtro de categoría
// Inputs:  productos[], categorias[], loading, totalElementos, pagina, cantidadElementos, disabled
// Outputs: productoClick({producto,cantidad}), pageChange(n), busquedaChange(q), categoriaChange(cat)
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnDestroy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ImagenPipe }            from '../../pipes/imagen.pipe';
import { PosCantidadComponent }  from './pos-cantidad.component';

@Component({
  selector: 'app-pos-catalogo',
  standalone: true,
  imports: [CommonModule, ImagenPipe, PosCantidadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cat-wrap">

      <!-- Barra de controles — superficie limpia -->
      <div class="cat-bar">
        <div class="cat-search-box">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input class="cat-search-input"
                 placeholder="Buscar producto..."
                 [disabled]="disabled"
                 (input)="buscar$.next($any($event.target).value)"/>
        </div>

        <div class="cat-cantidad-wrap">
          <app-pos-cantidad
            [(valor)]="cantidad"
            [disabled]="disabled"
            size="lg"/>
        </div>

        @if (!disabled && categorias.length > 0) {
          <button class="cat-cat-btn" (click)="modalCatOpen = true" [class.active]="catSeleccionada">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
            {{ catSeleccionada?.descripcion ?? 'Categorías' }}
            @if (catSeleccionada) {
              <span class="cat-cat-clear" (click)="$event.stopPropagation(); onCat(null)">×</span>
            }
          </button>
        }

        <!-- Modal de categorías -->
        @if (modalCatOpen) {
          <div class="cat-modal-overlay" (click)="modalCatOpen = false">
            <div class="cat-modal-box" (click)="$event.stopPropagation()">
              <div class="cat-modal-hdr">
                <span>Categorías</span>
                <button class="cat-modal-close" (click)="modalCatOpen = false">✕</button>
              </div>
              <div class="cat-modal-grid">
                <button class="cat-cat-opt" [class.selected]="!catSeleccionada"
                        (click)="onCat(null); modalCatOpen = false">
                  Todos
                </button>
                @for (cat of categorias; track cat.codCategoriaProducto) {
                  <button class="cat-cat-opt" [class.selected]="catSeleccionada?.codCategoriaProducto === cat.codCategoriaProducto"
                          (click)="onCat(cat); modalCatOpen = false">
                    {{ cat.descripcion }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- Toggle grid / lista -->
        <div class="cat-view-toggle">
          <button class="cat-view-btn" [class.active]="vista() === 'grid'"
                  title="Vista cuadrícula" (click)="vista.set('grid')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="cat-view-btn" [class.active]="vista() === 'lista'"
                  title="Vista lista" (click)="vista.set('lista')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contador -->
      @if (!disabled) {
        <div class="cat-count">
          {{ totalElementos | number:'1.0-0' }} productos
        </div>
      }

      <!-- Loading -->
      @if (loading) {
        <div class="cat-status">
          <span class="cat-spinner"></span> Cargando...
        </div>
      }

      <!-- Sin resultados -->
      @if (disabled) {
        <div class="cat-status cat-status-waiting">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Seleccione un cliente para ver productos
        </div>
      }
      @if (!loading && !disabled && productos.length === 0) {
        <div class="cat-status">No se encontraron productos</div>
      }

      <!-- VISTA GRID -->
      @if (!disabled && vista() === 'grid') {
        <div class="cat-grid">
          @for (p of productos; track p.codProducto) {
            <div class="cat-card" (click)="onProducto(p)">
              <div class="cat-img-container">
                @if (p.img) {
                  <div class="cat-img-wrap">
                    <img [src]="p.img | imagen:'productos' | async"
                         class="cat-img" [alt]="p.nombreProducto" loading="lazy"/>
                  </div>
                } @else {
                  <div class="cat-img-ph">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                }
                <span class="cat-erp-badge">{{ p.codProductoErp }}</span>
              </div>
              <div class="cat-label" [title]="p.nombreProducto">{{ p.nombreProducto }}</div>
            </div>
          }
        </div>
      }

      <!-- VISTA LISTA -->
      @if (!disabled && vista() === 'lista') {
        <div class="cat-list">
          @for (p of productos; track p.codProducto) {
            <div class="cat-list-item" (click)="onProducto(p)">
              @if (p.img) {
                <div class="cat-list-img-wrap">
                  <img [src]="p.img | imagen:'productos' | async"
                       class="cat-list-img" [alt]="p.nombreProducto" loading="lazy"/>
                </div>
              } @else {
                <div class="cat-list-img-ph">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              }
              <div class="cat-list-info">
                <span class="cat-list-label" [title]="p.nombreProducto">
                  {{ p.nombreProducto }}
                </span>
                <span class="cat-list-sku">#{{ p.codProductoErp }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Paginador -->
      @if (!disabled && totalElementos > cantidadElementos) {
        <div class="cat-pager">
          <button class="pag-btn" [disabled]="pagina === 0"
                  (click)="onPage(pagina)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          @for (p of pageNums; track $index) {
            @if (p === '...') { <span class="pag-ellipsis">…</span> }
            @else {
              <button class="pag-btn" [class.active]="p === pagina + 1"
                      (click)="onPage(+p)">{{ p }}</button>
            }
          }
          <button class="pag-btn" [disabled]="pagina >= totalPages - 1"
                  (click)="onPage(pagina + 2)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './pos-catalogo.component.css',
})
export class PosCatalogoComponent implements OnInit, OnDestroy {
  @Input() productos:        any[]   = [];
  @Input() categorias:       any[]   = [];
  @Input() loading           = false;
  @Input() totalElementos    = 0;
  @Input() pagina            = 0;
  @Input() cantidadElementos = 16;
  @Input() disabled          = false;

  @Output() productoClick   = new EventEmitter<{ producto: any; cantidad: number }>();
  @Output() pageChange      = new EventEmitter<number>();
  @Output() busquedaChange  = new EventEmitter<string>();
  @Output() categoriaChange = new EventEmitter<any>();

  cantidad       = 1;
  catSeleccionada: any = null;
  modalCatOpen   = false;
  // Vista lista por defecto en móvil, grid en desktop
  vista = signal<'grid' | 'lista'>(
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'lista' : 'grid'
  );

  readonly buscar$  = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.buscar$.pipe(debounceTime(380), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(q => this.busquedaChange.emit(q));
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onProducto(p: any): void { this.productoClick.emit({ producto: p, cantidad: this.cantidad }); this.cantidad = 1; }
  onCat(cat: any): void    { this.catSeleccionada = cat; this.categoriaChange.emit(cat); }
  onPage(p: number): void  { this.pageChange.emit(p); }

  get totalPages(): number { return Math.ceil(this.totalElementos / Math.max(this.cantidadElementos, 1)); }
  get pageNums(): (number | '...')[] {
    const t = this.totalPages, c = this.pagina + 1;
    if (t <= 9) return Array.from({ length: t }, (_, i) => i + 1);
    const r: (number | '...')[] = [1];
    if (c > 4) r.push('...');
    // Mostrar 5 páginas alrededor de la actual
    const from = Math.max(2, c - 2);
    const to   = Math.min(t - 1, c + 2);
    for (let i = from; i <= to; i++) r.push(i);
    if (c < t - 3) r.push('...');
    r.push(t);
    return r;
  }
}