import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }            from '../../core/services/auth.service';
import { SearchStateService }     from '../../core/services/search-state.service';
import { VentasService }          from '../../core/services/domain/ventas.service';
import { SucursalService }        from '../../core/services/domain/sucursal.service';
import { UsuariosService }        from '../../core/services/domain/usuarios.service';
import { MotivoAnulacionService } from '../../core/services/domain/motivo-anulacion.service';
import { ClienteService }         from '../../core/services/domain/cliente.service';
import { ToastService }           from '../../shared/components/toast/toast.service';
import { SelectSearchComponent }  from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-ventas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ventas-lista.component.html',
  styleUrl: './ventas-lista.component.css',
})
export class VentasListaComponent implements OnInit {
  private readonly auth      = inject(AuthService);
  private readonly stateSvc  = inject(SearchStateService);
  private readonly svc       = inject(VentasService);
  private readonly router    = inject(Router);
  private readonly sucSvc    = inject(SucursalService);
  private readonly usSvc     = inject(UsuariosService);
  private readonly cliSvc    = inject(ClienteService);
  private readonly motivoSvc = inject(MotivoAnulacionService);
  private readonly toast     = inject(ToastService);

  // ── Lista ─────────────────────────────────────────────────
  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  pageNumbers = computed(() => {
    const total = this.totalPages(), cur = this.currentPage();
    if (total <= 7) return Array.from({length: total}, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur-1); i <= Math.min(total-2, cur+1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  // ── Filtros ────────────────────────────────────────────────
  fechaDesde = signal(this._today());
  fechaHasta = signal(this._today());
  nroComprobante = signal('');
  estado     = signal('TODOS');
  tipoVenta  = signal('');
  anulado    = signal<boolean | null>(null);

  sucursales  = signal<any[]>([]);
  usuarios    = signal<any[]>([]);
  clientes    = signal<any[]>([]);
  motivos     = signal<any[]>([]);
  selSucursal = signal<any>(null);
  selUsuario  = signal<any>(null);
  selCliente  = signal<any>(null);

  // ── Totales ─────────────────────────────────────────────
  totalGs   = signal(0);
  totalKg   = signal(0);
  totalCant = signal(0);

  // ── Modal anular ───────────────────────────────────────────
  showAnularModal  = signal(false);
  ventaAnular      = signal<any>(null);
  selMotivo        = signal<any>(null);
  anulando         = signal(false);

  readonly estadoOpts = ['TODOS','CONFIRMADO','PENDIENTE','PROCESADO','ENTREGADO'];
  readonly tipoOpts   = ['','VENTA','OBSEQUIO','PEDIDO'];

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.usSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.usuarios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.motivoSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.motivos.set(Array.isArray(r) ? r : []) });

    const saved = this.stateSvc.get('ventas-lista');
    if (saved) {
      this.fechaDesde.set(saved.fechaDesde);
      this.fechaHasta.set(saved.fechaHasta);
      this.nroComprobante.set(saved.nroComprobante);
      this.estado.set(saved.estado);
      this.tipoVenta.set(saved.tipoVenta);
      this.anulado.set(saved.anulado);
      this.selSucursal.set(saved.selSucursal);
      this.selUsuario.set(saved.selUsuario);
      this.selCliente.set(saved.selCliente);
      if (saved.selCliente) this.clientes.set([saved.selCliente]);
      this.buscar(saved.page ?? 0);
    } else {
      if (codSuc > 0) {
        this.sucSvc.getById(codSuc).subscribe({ next: (s: any) => this.selSucursal.set(s) });
      }
      this.buscar();
    }
  }

  buscar(page = 0): void {
    this.stateSvc.save('ventas-lista', {
      fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta(),
      nroComprobante: this.nroComprobante(), estado: this.estado(),
      tipoVenta: this.tipoVenta(), anulado: this.anulado(),
      selSucursal: this.selSucursal(), selUsuario: this.selUsuario(),
      selCliente: this.selCliente(), page,
    });
    this.loading.set(true);
    this.svc.findByFecha(
      page,
      this.fechaDesde(), this.fechaHasta(),
      this.selCliente(), this.selUsuario(), this.selSucursal(),
      this.nroComprobante(), this.tipoVenta(),
      this.estado(), 20, this.anulado()
    ).subscribe({
      next: (r: any) => {
        this.items.set(Array.isArray(r) ? r : (r.content ?? []));
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar ventas'); }
    });

    // Totales
    this.svc.findTotal(
      this.fechaDesde(), this.fechaHasta(),
      this.selCliente(), this.selUsuario(), this.selSucursal(),
      this.nroComprobante(), this.tipoVenta(), this.estado()
    ).subscribe({
      next: t => { this.totalGs.set(t?.totalGs ?? 0); this.totalKg.set(t?.totalKg ?? 0); this.totalCant.set(t?.cantidad ?? 0); },
      error: () => { this.totalGs.set(0); this.totalKg.set(0); this.totalCant.set(0); }
    });
  }

  limpiar(): void {
    this.stateSvc.clear('ventas-lista');
    this.fechaDesde.set(this._today());
    this.fechaHasta.set(this._today());
    this.nroComprobante.set('');
    this.estado.set('TODOS');
    this.tipoVenta.set('');
    this.anulado.set(null);
    this.selSucursal.set(null);
    this.selUsuario.set(null);
    this.selCliente.set(null);
    this.buscar(0);
  }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    this.buscar(p);
  }

  verComprobante(item: any): void {
    if (item.tipoComprobante === 'FACTURA') {
      // FACTURA → reporte PDF en backend (ventas/report/?venta_id=X&tipo=...)
      this.svc.verTicketPdf(item.codVenta, ' Cliente - Comprador').subscribe({
        next: (blob: Blob) => this._openBlob(blob),
        error: () => this.toast.error('Error al obtener comprobante')
      });
    } else {
      // Ticket / boleta → página HTML de impresión
      this.router.navigate(['/ticket-venta', item.codVenta]);
    }
  }

  private _openBlob(blob: Blob): void {
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  solicitarAnular(venta: any): void {
    this.ventaAnular.set(venta);
    this.selMotivo.set(null);
    this.showAnularModal.set(true);
  }

  confirmarAnular(): void {
    const v = this.ventaAnular(); if (!v) return;
    this.anulando.set(true);
    this.svc.anular(v.codVenta, this.selMotivo()).subscribe({
      next: () => {
        this.anulando.set(false);
        this.showAnularModal.set(false);
        this.toast.success('Venta anulada');
        this.buscar(this.currentPage());
      },
      error: (e: any) => { this.anulando.set(false); this.toast.apiError(e); }
    });
  }

  buscarClientes(q: string): void {
    if (!q || q.length < 2) return;
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.cliSvc.getPage(0, q, codEmp).subscribe({ next: r => this.clientes.set(Array.isArray(r) ? r : (r?.content ?? [])) });
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }
  isCajero(): boolean {
    const roles = this.auth.session?.authorities ?? [];
    return roles.includes('ROLE_CAJERO') || roles.includes('ROLE_CAJERO_SUP') || this.isAdmin();
  }

  private _today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
