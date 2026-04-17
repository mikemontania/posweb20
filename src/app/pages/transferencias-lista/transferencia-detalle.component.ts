import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransferenciaService } from '../../core/services/domain/transferencia.service';
import { ToastService }         from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-transferencia-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Transferencia <span style="font-weight:400;color:var(--text-muted)">#{{ id() }}</span></h1>
        </div>
        <div class="page-header-actions">
          <a routerLink="/transferencias-lista" class="btn btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Volver
          </a>
        </div>
      </div>

      @if (loading()) {
        <div class="table-loading"><span class="spinner"></span><span>Cargando...</span></div>
      }

      @if (!loading() && transferencia()) {
        <!-- Cabecera -->
        <div class="card" style="padding:1.25rem;margin-bottom:1rem">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem 1.5rem">
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">N° Comprobante</span><div><code>{{ transferencia()?.nroComprobante ?? '—' }}</code></div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Fecha</span><div>{{ transferencia()?.fecha ? (transferencia()?.fecha | date:'dd/MM/yyyy') : '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Depósito Emisor</span><div><strong>{{ transferencia()?.depositoEmisor?.descripcion ?? '—' }}</strong></div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Depósito Receptor</span><div><strong>{{ transferencia()?.depositoReceptor?.descripcion ?? '—' }}</strong></div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Motivo</span><div>{{ transferencia()?.motivoTransferencia?.descripcion ?? '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Total Productos</span><div><strong>{{ transferencia()?.totalProducto ?? 0 }}</strong></div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Usuario</span><div>{{ transferencia()?.usuario ?? '—' }}</div></div>
            <div><span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Anulado</span><div>
              @if (transferencia()?.anulado) { <span class="badge badge-danger">Sí</span> } @else { <span class="badge badge-success">No</span> }
            </div></div>
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
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">Emisor Inicio</th>
                  <th class="text-right">Emisor Fin</th>
                  <th class="text-right">Receptor Inicio</th>
                  <th class="text-right">Receptor Fin</th>
                </tr>
              </thead>
              <tbody>
                @for (d of transferencia()?.detalle ?? []; track d.codTransferenciaDetalle; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td>
                      <div><strong>{{ d.producto?.descripcion ?? '—' }}</strong></div>
                      <div style="font-size:.75rem;color:var(--text-muted)">{{ d.producto?.codProducto }}</div>
                    </td>
                    <td>{{ d.unidadMedida?.descripcion ?? '—' }}</td>
                    <td class="text-right"><strong>{{ d.cantidadTransferencia | number:'1.0-0' }}</strong></td>
                    <td class="text-right">{{ (d.emisorInicio ?? 0) | number:'1.0-0' }}</td>
                    <td class="text-right">{{ (d.emisorFin ?? 0) | number:'1.0-0' }}</td>
                    <td class="text-right">{{ (d.receptorInicio ?? 0) | number:'1.0-0' }}</td>
                    <td class="text-right">{{ (d.receptorFin ?? 0) | number:'1.0-0' }}</td>
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
export class TransferenciaDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(TransferenciaService);
  private readonly toast = inject(ToastService);

  id             = signal(0);
  transferencia  = signal<any>(null);
  loading        = signal(false);

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.id.set(id);
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: (t: any) => { this.transferencia.set(t); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar la transferencia'); }
    });
  }
}
