// pos-totales — muestra TOTAL VENTA / % DESCUENTO / TOTAL DESC / TOTAL A PAGAR
// Input: venta (objeto con importeTotal, subTotal, importeDescuento, descuentoProducto)
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-pos-totales',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pt-wrap">
      <div class="pt-subtotales">
        @if (totalDescuento > 0) {
          <div class="pt-row">
            <span class="pt-label">Total venta</span>
            <span class="pt-value">{{ totalVenta | number:'1.0-0' }} Gs.</span>
          </div>
        }
        @if (totalDescuento > 0) {
          <div class="pt-row">
            <span class="pt-label">Descuento</span>
            <span class="pt-value pt-discount">−{{ porcDescuento | number:'1.2-2' }}%</span>
          </div>
          <div class="pt-row">
            <span class="pt-label">Total descuento</span>
            <span class="pt-value pt-discount">−{{ totalDescuento | number:'1.0-0' }} Gs.</span>
          </div>
        }
      </div>
      <div class="pt-total">
        <span class="pt-total-label">Total a pagar</span>
        <span class="pt-total-value">{{ venta?.importeTotal ?? 0 | number:'1.0-0' }} Gs.</span>
      </div>
    </div>
  `,
  styles: [`
    .pt-wrap {
      flex-shrink: 0;
      border-top: 1px solid var(--border-color);
    }
    .pt-subtotales {
      padding: .45rem .875rem .35rem;
      background: var(--bg-surface-2);
    }
    .pt-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: .1rem 0;
    }
    .pt-label {
      font-size: .75rem; color: var(--text-muted); font-weight: 500;
    }
    .pt-value {
      font-size: .78rem; color: var(--text-secondary); font-weight: 500;
    }
    .pt-discount {
      color: var(--status-success-text); font-weight: 600;
    }
    .pt-total {
      display: flex; justify-content: space-between; align-items: center;
      padding: .55rem .875rem;
      background: var(--bg-surface);
    }
    .pt-total-label {
      font-size: .8125rem; font-weight: 600;
      color: var(--text-secondary); text-transform: uppercase;
      letter-spacing: .04em;
    }
    .pt-total-value {
      font-size: 1.125rem; font-weight: 800;
      color: var(--text-primary); letter-spacing: -.02em;
    }
  `]
})
export class PosTotalesComponent {
  @Input() venta: any = null;
  /** Cuando se pasa, se usa este % en vez del calculado (fiel al ng12 porcentajeDescuento) */
  @Input() porcDescuentoOverride: number | null = null;

  get totalVenta():    number { return (this.venta?.importeTotal ?? 0) + (this.venta?.importeDescuento ?? 0); }
  get totalDescuento():number { return (this.venta?.importeDescuento ?? 0) + (this.venta?.descuentoProducto ?? 0); }
  get porcDescuento(): number {
    if (this.porcDescuentoOverride !== null) return this.porcDescuentoOverride;
    const sub = this.venta?.subTotal ?? 0;
    return sub > 0 ? (this.totalDescuento * 100 / sub) : 0;
  }
}