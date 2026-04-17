import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ComprasService } from '../../core/services/domain/compras.service';
import { ToastService }   from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-compra-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Compra <span style="font-weight:400;color:var(--text-muted)">#{{ id() }}</span></h1>
        </div>
        <div class="page-header-actions">
          <a routerLink="/compras-lista" class="btn btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Volver
          </a>
        </div>
      </div>

      @if (loading()) {
        <div class="table-loading"><span class="spinner"></span><span>Cargando...</span></div>
      }

      @if (!loading() && compra()) {
        <!-- Cabecera -->
        <div class="card" style="padding:1.25rem;margin-bottom:1rem">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem 1.5rem">
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Proveedor</span><div><strong>{{ compra()?.proveedor?.razonSocial ?? '—' }}</strong></div><div style="font-size:.75rem;color:var(--text-muted)">{{ compra()?.proveedor?.ruc ?? '' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Fecha</span><div>{{ compra()?.fechaCompra ? (compra()?.fechaCompra | date:'dd/MM/yyyy') : '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">N° Comprobante</span><div><code>{{ compra()?.nroComprobante ?? '—' }}</code></div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Timbrado</span><div>{{ compra()?.timbrado ?? '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Inicio Timbrado</span><div>{{ compra()?.inicioTimbrado ?? '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Fin Timbrado</span><div>{{ compra()?.finTimbrado ?? '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">F. Vencimiento</span><div>{{ compra()?.fechaVencimiento ? (compra()?.fechaVencimiento | date:'dd/MM/yyyy') : '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Estado</span><div>
              <span class="badge" [class]="'badge-' + (compra()?.estado === 'CONFIRMADO' ? 'success' : 'secondary')">{{ compra()?.estado ?? '—' }}</span>
            </div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Anulado</span><div>
              @if (compra()?.anulado) { <span class="badge badge-danger">Sí</span> } @else { <span class="badge badge-success">No</span> }
            </div></div>
          </div>
        </div>

        <!-- Totales -->
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
          <div class="card" style="padding:.65rem 1rem;flex:1;text-align:right">
            <div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase">Sub Total</div>
            <div style="font-weight:700">{{ (compra()?.subTotal ?? 0) | number:'1.0-0' }} Gs.</div>
          </div>
          <div class="card" style="padding:.65rem 1rem;flex:1;text-align:right">
            <div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase">IVA 5%</div>
            <div style="font-weight:700">{{ (compra()?.importeIva5 ?? 0) | number:'1.0-0' }} Gs.</div>
          </div>
          <div class="card" style="padding:.65rem 1rem;flex:1;text-align:right">
            <div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase">IVA 10%</div>
            <div style="font-weight:700">{{ (compra()?.importeIva10 ?? 0) | number:'1.0-0' }} Gs.</div>
          </div>
          <div class="card" style="padding:.65rem 1rem;flex:1;text-align:right;border-color:var(--color-accent)">
            <div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase">Total</div>
            <div style="font-weight:800;font-size:1.15rem;color:var(--color-accent)">{{ (compra()?.importeTotal ?? 0) | number:'1.0-0' }} Gs.</div>
          </div>
        </div>

        <!-- Detalle -->
        <div class="card tabla-card">
          <div class="table-responsive">
            <table class="table tabla-parametros">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Unid. Medida</th>
                  <th>Depósito</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">Precio</th>
                  <th class="text-right">% Desc.</th>
                  <th class="text-right">% IVA</th>
                  <th class="text-right">Neto</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                @for (d of compra()?.detalle ?? []; track d.codCompraDetalle; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td>
                      <div><strong>{{ d.producto?.descripcion ?? '—' }}</strong></div>
                      <div style="font-size:.75rem;color:var(--text-muted)">{{ d.producto?.codProducto }}</div>
                    </td>
                    <td>{{ d.unidadMedida?.descripcion ?? '—' }}</td>
                    <td>{{ d.deposito?.descripcion ?? '—' }}</td>
                    <td class="text-right">{{ d.cantidad | number:'1.0-0' }}</td>
                    <td class="text-right">{{ (d.importePrecio ?? 0) | number:'1.0-0' }} Gs.</td>
                    <td class="text-right">{{ d.porcDescuento ?? 0 }}%</td>
                    <td class="text-right">{{ d.porcIva ?? 0 }}%</td>
                    <td class="text-right">{{ (d.importeNeto ?? 0) | number:'1.0-0' }} Gs.</td>
                    <td class="text-right"><strong>{{ (d.importeTotal ?? 0) | number:'1.0-0' }} Gs.</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class CompraDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(ComprasService);
  private readonly toast = inject(ToastService);

  id      = signal(0);
  compra  = signal<any>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.id.set(id);
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: (c: any) => { this.compra.set(c); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar la compra'); }
    });
  }
}
