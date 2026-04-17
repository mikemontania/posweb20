import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { DatePipe, DecimalPipe, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { VentasService } from '../../core/services/domain/ventas.service';
import { ToastService }  from '../../shared/components/toast/toast.service';
import { ImagenPipe }    from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [DatePipe, DecimalPipe, AsyncPipe, RouterModule, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './venta-detalle.component.html',
  styleUrl: './venta-detalle.component.css',
})
export class VentaDetalleComponent implements OnInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly svc      = inject(VentasService);
  private readonly toast    = inject(ToastService);

  loading  = signal(true);
  venta    = signal<any>(null);
  detalles = signal<any[]>([]);
  cobranza = signal<any>(null);
  cobDet   = signal<any[]>([]);
  descuentos = signal<any[]>([]);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (!id) { this.loading.set(false); return; }
    this.svc.getById(id).subscribe({
      next: (r: any) => {
        const v = r?.venta ?? r;
        this.venta.set(v);
        this.detalles.set(v.detalle ?? []);
        this.descuentos.set(v.descuentos ?? []);
        if (v.cobranza) {
          this.cobranza.set(v.cobranza);
          this.cobDet.set(v.cobranza.detalle ?? []);
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  atras(): void { this.location.back(); }

  verTicket(): void {
    const v = this.venta();
    if (!v) return;
    this.svc.verTicketPdf(v.codVenta, 'Original: Cliente - Comprador').subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: () => this.toast.error('Error al generar ticket')
    });
  }

  verComprobante(): void {
    const v = this.venta();
    if (!v) return;
    this.svc.traercomprobante(v.codVenta).subscribe({
      next: (blob: Blob) => {
        const pdf = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdf);
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      },
      error: () => this.toast.error('Error al obtener comprobante')
    });
  }
}
