import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService }                 from '../../core/services/auth.service';
import { SearchStateService }          from '../../core/services/search-state.service';
import { ComprasService }              from '../../core/services/domain/compras.service';
import { ProveedorService }            from '../../core/services/domain/proveedor.service';
import { MotivoAnulacionCompraService } from '../../core/services/domain/motivo-anulacion-compra.service';
import { ToastService }                from '../../shared/components/toast/toast.service';
import { SelectSearchComponent }       from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-compras-lista',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compras-lista.component.html',
  styleUrl: './compras-lista.component.css',
})
export class ComprasListaComponent implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly stateSvc   = inject(SearchStateService);
  private readonly svc        = inject(ComprasService);
  private readonly provSvc    = inject(ProveedorService);
  private readonly motivoSvc  = inject(MotivoAnulacionCompraService);
  private readonly toast      = inject(ToastService);

  // ── Lista ─────────────────────────────────────────────────
  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  totalImporte = computed(() => this.items().reduce((s, c) => s + (c.importeTotal ?? 0), 0));

  pageNumbers = computed(() => {
    const total = this.totalPages(), cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  // ── Filtros ────────────────────────────────────────────────
  fechaDesde     = signal(this._today());
  fechaHasta     = signal(this._today());
  nroComprobante = signal('');
  estado         = signal('TODOS');

  proveedores  = signal<any[]>([]);
  motivos      = signal<any[]>([]);
  selProveedor = signal<any>(null);

  // ── Modal anular ───────────────────────────────────────────
  showAnularModal = signal(false);
  compraAnular    = signal<any>(null);
  selMotivo       = signal<any>(null);
  anulando        = signal(false);

  readonly estadoOpts = ['TODOS', 'CONFIRMADO', 'PENDIENTE', 'ANULADO'];

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.provSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.proveedores.set(Array.isArray(r) ? r : (r.content ?? []))
    });
    this.motivoSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.motivos.set(Array.isArray(r) ? r : [])
    });

    const saved = this.stateSvc.get('compras-lista');
    if (saved) {
      this.fechaDesde.set(saved.fechaDesde);
      this.fechaHasta.set(saved.fechaHasta);
      this.nroComprobante.set(saved.nroComprobante);
      this.estado.set(saved.estado);
      this.selProveedor.set(saved.selProveedor);
      if (saved.selProveedor) this.proveedores.set([saved.selProveedor]);
      this.buscar(saved.page ?? 0);
    } else {
      this.buscar();
    }
  }

  buscar(page = 0): void {
    this.stateSvc.save('compras-lista', {
      fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta(),
      nroComprobante: this.nroComprobante(), estado: this.estado(),
      selProveedor: this.selProveedor(), page,
    });
    this.loading.set(true);
    this.svc.findByFecha(
      page,
      this.fechaDesde(), this.fechaHasta(),
      this.selProveedor(), null,
      this.nroComprobante(), this.estado(), 20
    ).subscribe({
      next: (r: any) => {
        this.items.set(Array.isArray(r) ? r : (r.content ?? []));
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar compras'); }
    });
  }

  limpiar(): void {
    this.stateSvc.clear('compras-lista');
    this.fechaDesde.set(this._today());
    this.fechaHasta.set(this._today());
    this.nroComprobante.set('');
    this.estado.set('TODOS');
    this.selProveedor.set(null);
    this.buscar(0);
  }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    this.buscar(p);
  }

  solicitarAnular(compra: any): void {
    this.compraAnular.set(compra);
    this.selMotivo.set(null);
    this.showAnularModal.set(true);
  }

  confirmarAnular(): void {
    const c = this.compraAnular();
    if (!c) return;
    if (!this.selMotivo()) { this.toast.error('Seleccione un motivo de anulación'); return; }
    this.anulando.set(true);
    this.svc.anular(c.codCompra, this.selMotivo()).subscribe({
      next: () => {
        this.anulando.set(false);
        this.showAnularModal.set(false);
        this.toast.success('Compra anulada');
        this.buscar(this.currentPage());
      },
      error: (e: any) => { this.anulando.set(false); this.toast.apiError(e); }
    });
  }

  buscarProveedores(q: string): void {
    if (!q || q.length < 2) return;
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.provSvc.getPage(0, q, codEmp).subscribe({
      next: (r: any) => this.proveedores.set(Array.isArray(r) ? r : (r.content ?? []))
    });
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
