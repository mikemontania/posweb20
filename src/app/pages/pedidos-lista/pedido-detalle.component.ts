import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService }        from '../../core/services/domain/pedidos.service';
import { MotivoAnulacionService } from '../../core/services/domain/motivo-anulacion.service';
import { AuthService }           from '../../core/services/auth.service';
import { ToastService }          from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { ImagenPipe }            from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SelectSearchComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedido-detalle.component.html',
  styleUrl: './pedido-detalle.component.css',
})
export class PedidoDetalleComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly location   = inject(Location);
  private readonly svc        = inject(PedidosService);
  private readonly motivoSvc  = inject(MotivoAnulacionService);
  private readonly auth       = inject(AuthService);
  private readonly toast      = inject(ToastService);

  loading   = signal(true);
  pedido    = signal<any>(null);
  detalles  = signal<any[]>([]);
  cobranza  = signal<any>(null);
  cobDet    = signal<any[]>([]);
  pagado    = signal(false);

  // Delivery copy
  copiado = signal(false);

  // Estado cambios
  actualizando     = signal(false);
  showAnularModal  = signal(false);
  motivos          = signal<any[]>([]);
  selMotivo        = signal<any>(null);
  anulando         = signal(false);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (!id) { this.loading.set(false); return; }
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.motivoSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.motivos.set(Array.isArray(r) ? r : []) });
    this._cargar(id);
  }

  private _cargar(id: number): void {
    this.loading.set(true);
    this.svc.getById(id).subscribe({
      next: (r: any) => {
        const p = r?.pedido ?? r;
        this.pedido.set(p);
        this.detalles.set(p.detalle ?? []);
        if (p.cobranza) {
          this.cobranza.set(p.cobranza);
          this.cobDet.set(p.cobranza.detalle ?? []);
          this.pagado.set(true);
        } else {
          this.cobranza.set(null);
          this.cobDet.set([]);
          this.pagado.set(false);
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  confirmar(): void {
    const p = this.pedido(); if (!p) return;
    this.actualizando.set(true);
    this.svc.confirmar(p.codPedido).subscribe({
      next: () => { this.toast.success('Pedido confirmado'); this._cargar(p.codPedido); this.actualizando.set(false); },
      error: (e: any) => { this.actualizando.set(false); this.toast.apiError(e); }
    });
  }

  procesar(): void {
    const p = this.pedido(); if (!p) return;
    this.actualizando.set(true);
    this.svc.procesar(p.codPedido).subscribe({
      next: () => { this.toast.success('Pedido procesado'); this._cargar(p.codPedido); this.actualizando.set(false); },
      error: (e: any) => { this.actualizando.set(false); this.toast.apiError(e); }
    });
  }

  entregar(): void {
    const p = this.pedido(); if (!p) return;
    this.actualizando.set(true);
    this.svc.entregar(p.codPedido).subscribe({
      next: () => { this.toast.success('Pedido entregado'); this._cargar(p.codPedido); this.actualizando.set(false); },
      error: (e: any) => { this.actualizando.set(false); this.toast.apiError(e); }
    });
  }

  solicitarAnular(): void {
    this.selMotivo.set(null);
    this.showAnularModal.set(true);
  }

  confirmarAnular(): void {
    const p = this.pedido(); if (!p) return;
    this.anulando.set(true);
    this.svc.anular(p.codPedido, this.selMotivo()).subscribe({
      next: () => {
        this.anulando.set(false); this.showAnularModal.set(false);
        this.toast.success('Pedido anulado'); this._cargar(p.codPedido);
      },
      error: (e: any) => { this.anulando.set(false); this.toast.apiError(e); }
    });
  }

  copiarDelivery(): void {
    const p = this.pedido();
    if (!p) return;
    const lines = [
      p.cliente?.razonSocial ?? '',
      p.cliente?.docNro ?? '',
      p.cliente?.direccion ?? '',
      p.cliente?.telefono ?? '',
      p.observacion ?? ''
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 3000);
    });
  }

  atras(): void { this.location.back(); }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }
  isCajero(): boolean {
    const r = this.auth.session?.authorities ?? [];
    return r.includes('ROLE_CAJERO') || r.includes('ROLE_CAJERO_SUP') || this.isAdmin();
  }
}
