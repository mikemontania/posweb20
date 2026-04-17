import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { VentasService }   from '../../core/services/domain/ventas.service';
import { EmpresasService } from '../../core/services/domain/empresas.service';
import { SucursalService } from '../../core/services/domain/sucursal.service';
import { ToastService }    from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-ticket-venta',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-venta.component.html',
  styleUrl: './ticket-venta.component.css',
})
export class TicketVentaComponent implements OnInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly ventaSvc = inject(VentasService);
  private readonly empSvc   = inject(EmpresasService);
  private readonly sucSvc   = inject(SucursalService);
  private readonly toast    = inject(ToastService);

  listo        = signal(false);
  loading      = signal(true);
  venta        = signal<any>(null);
  empresa      = signal<any>(null);
  sucursal     = signal<any>(null);
  detalles     = signal<any[]>([]);
  cobranza     = signal<any>(null);
  cobranzaDet  = signal<any[]>([]);
  mostrarForma = signal(false);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (!id) { this.loading.set(false); return; }

    this.ventaSvc.getById(id).subscribe({
      next: (resp: any) => {
        const v = resp?.venta ?? resp;
        this.venta.set(v);
        this.detalles.set(v.detalle ?? []);

        // Determinar si se muestra forma de venta
        const esObsequio = v.esObsequio === true;
        const formaId    = v.formaVenta?.codFormaVenta ?? 0;
        if (formaId !== 1 || esObsequio) {
          this.mostrarForma.set(true);
        } else {
          this.mostrarForma.set(false);
          this.cobranza.set(v.cobranza ?? null);
          this.cobranzaDet.set(v.cobranza?.detalle ?? []);
        }

        // Cargar empresa y sucursal en paralelo
        this.empSvc.getById(v.codEmpresa).subscribe({
          next: (e: any) => {
            this.empresa.set(e);
            this.sucSvc.getById(v.codSucursal).subscribe({
              next: (s: any) => {
                this.sucursal.set(s);
                this.listo.set(true);
                this.loading.set(false);
              },
              error: () => { this.loading.set(false); }
            });
          },
          error: () => { this.loading.set(false); }
        });
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Error al cargar la venta');
      }
    });
  }

  get totalElementos(): number { return this.detalles().length; }

  atras(): void { this.location.back(); }

  imprimirOriginal(): void { window.print(); }

  verPDF(tipo: string): void {
    const v = this.venta();
    if (!v) return;
    this.ventaSvc.verTicketPdf(v.codVenta, tipo).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: () => this.toast.error('Error al generar PDF')
    });
  }
}
