// pos-cliente-venta — zona de cliente para el POS de Ventas
// Botones opcionales: cargar pedido, nuevo cliente, cupón, influencer
// Basado en ng12: ventas tenía buscar + crear cliente + cargar pedido + cupón + influencer
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, ViewChild, SimpleChanges, OnChanges
} from '@angular/core';
import { SelectSearchComponent } from '../select-search/select-search.component';

@Component({
  selector: 'app-pos-cliente-venta',
  standalone: true,
  imports: [SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pc-wrap">
      @if (!mostrar) {
        <div class="pc-search-hdr">
          <span class="label-xs">Buscar cliente</span>
          <button class="pc-cancel-btn" (click)="cancelarBusqueda.emit()" title="Cancelar">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancelar
          </button>
        </div>
        <app-select-search
          [items]="clientes"
          bindLabel="concatDocNombre"
          bindValue="codCliente"
          placeholder="Escriba CI/RUC o nombre..."
          (changed)="clienteSeleccionado.emit($any($event))"
          (search)="buscarChange.emit($event)"/>
      } @else {
        <div class="pc-row">
          <div class="pc-nombre-wrap" [title]="razonSocial">
            <span class="pc-razon">{{ cliente?.razonSocial }}</span>
            <span class="pc-doc">{{ cliente?.tipoDoc }} {{ cliente?.docNro }}</span>
          </div>
          <div class="pc-btns">
            <button class="pc-btn" title="Buscar otro cliente" (click)="buscarClick.emit()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            @if (mostrarCargarPedido) {
              <button class="pc-btn" title="Cargar pedido" (click)="pedidoClick.emit()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            }
            @if (mostrarNuevoCliente) {
              <button class="pc-btn" title="Crear cliente" (click)="nuevoClienteClick.emit()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </button>
            }
            @if (mostrarCupon) {
              <button class="pc-btn" title="Cupón descuento" (click)="cuponClick.emit()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                </svg>
              </button>
            }
            @if (mostrarInfluencer) {
              <button class="pc-btn" title="Cupón Influencer" (click)="influencerClick.emit()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pc-wrap {
      padding: .35rem .75rem;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .label-xs {
      font-size: .62rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .06em; color: var(--text-muted); margin-bottom: .2rem;
    }
    .pc-row { display: flex; align-items: center; gap: .35rem; }
    .pc-nombre-wrap {
      flex: 1; min-width: 0;
      background: var(--bg-surface-2); border: 1px solid var(--border-color);
      border-radius: var(--radius-md, 8px); padding: .28rem .55rem;
      display: flex; flex-direction: column; gap: .06rem;
    }
    .pc-razon {
      font-size: .8rem; font-weight: 700; color: var(--text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      line-height: 1.2;
    }
    .pc-doc {
      font-size: .62rem; color: var(--text-muted); line-height: 1;
    }
    .pc-btns { display: flex; gap: .18rem; flex-shrink: 0; }
    .pc-btn {
      width: 26px; height: 26px; border: 1px solid var(--border-color);
      border-radius: var(--radius-sm, 4px); background: var(--bg-surface);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: all 120ms; padding: 0;
    }
    .pc-btn:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-light, #EFF6FF); }
    .pc-search-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: .2rem; }
    .pc-cancel-btn {
      display: flex; align-items: center; gap: .25rem;
      font-size: .62rem; font-weight: 600; color: var(--text-muted);
      border: none; background: none; cursor: pointer; padding: 2px 4px;
      border-radius: 4px; transition: all 120ms;
    }
    .pc-cancel-btn:hover { color: var(--status-danger-text); background: var(--status-danger-bg); }
  `]
})
export class PosClienteVentaComponent implements OnChanges {
  @ViewChild(SelectSearchComponent) private sel?: SelectSearchComponent;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && changes['mostrar'].previousValue === true && !this.mostrar) {
      setTimeout(() => this.sel?.open(), 50);
    }
  }

  @Input() cliente:             any    = null;
  @Input() razonSocial          = '';
  @Input() mostrar              = false;
  @Input() clientes:            any[]  = [];
  @Input() mostrarCargarPedido  = true;
  @Input() mostrarNuevoCliente  = true;
  @Input() mostrarCupon         = true;
  @Input() mostrarInfluencer    = true;

  @Output() buscarClick         = new EventEmitter<void>();
  @Output() pedidoClick         = new EventEmitter<void>();
  @Output() cuponClick          = new EventEmitter<void>();
  @Output() influencerClick     = new EventEmitter<void>();
  @Output() nuevoClienteClick   = new EventEmitter<void>();
  @Output() clienteSeleccionado = new EventEmitter<any>();
  @Output() buscarChange        = new EventEmitter<string>();
  @Output() cancelarBusqueda    = new EventEmitter<void>();
}
