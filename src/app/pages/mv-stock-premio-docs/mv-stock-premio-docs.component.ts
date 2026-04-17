import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }          from '../../core/services/auth.service';
import { StockPremioService }   from '../../core/services/domain/stock-premio.service';
import { SucursalService }      from '../../core/services/domain/sucursal.service';
import { ToastService }         from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-mv-stock-premio-docs',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mv-stock-premio-docs.component.html',
  styleUrl: './mv-stock-premio-docs.component.css',
})
export class MvStockPremioDocsComponent implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(StockPremioService);
  private readonly sucSvc  = inject(SucursalService);
  private readonly toast   = inject(ToastService);

  readonly operaciones = [
    { id: 'ENTRADA',    descripcion: 'ENTRADA'    },
    { id: 'OBSEQUIO',   descripcion: 'OBSEQUIO'   },
    { id: 'INVENTARIO', descripcion: 'INVENTARIO' },
  ];

  loading       = signal(false);
  items         = signal<any[]>([]);
  sucursales    = signal<any[]>([]);
  selSucursal   = signal<any>(null);
  selOperacion  = signal<any>(null);
  fechaDesde    = signal(this._today());
  fechaHasta    = signal(this._today());
  nroComprobante = signal('');
  size          = signal(20);

  // server-side pagination
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

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

  // modal detalle
  showDetalle    = signal(false);
  detalleLineas  = signal<any[]>([]);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    if (this.isAdmin()) {
      this.sucSvc.getAll({ codempresa: codEmp }).subscribe({
        next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? []))
      });
    } else if (codSuc > 0) {
      this.sucSvc.getById(codSuc).subscribe({
        next: (s: any) => { this.selSucursal.set(s); this.sucursales.set([s]); }
      });
    }
    this.buscar();
  }

  buscar(): void { this.cargar(0); }

  cargar(page: number): void {
    this.loading.set(true);
    const codSuc    = this.selSucursal()?.codSucursal ?? 0;
    const operacion = this.selOperacion()?.id ?? '';
    this.svc.findByFecha(
      this.size(), page,
      this.fechaDesde(), this.fechaHasta(),
      codSuc, this.nroComprobante(), operacion
    ).subscribe({
      next: (r: any) => {
        this.items.set(r.content ?? []);
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar movimientos'); }
    });
  }

  limpiar(): void {
    this.fechaDesde.set(this._today());
    this.fechaHasta.set(this._today());
    this.nroComprobante.set('');
    this.selOperacion.set(null);
    if (this.isAdmin()) this.selSucursal.set(null);
    this.buscar();
  }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    if (p < 0 || p >= this.totalPages()) return;
    this.cargar(p);
  }

  verDetalle(item: any): void {
    this.detalleLineas.set(item.detalle ?? []);
    this.showDetalle.set(true);
  }

  badgeClass(op: string): string {
    if (op === 'ENTRADA')    return 'badge badge-success';
    if (op === 'OBSEQUIO')   return 'badge badge-primary';
    return 'badge badge-warning';
  }

  isAdmin(): boolean {
    return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
