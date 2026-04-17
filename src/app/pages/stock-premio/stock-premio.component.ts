import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { DecimalPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }          from '../../core/services/auth.service';
import { StockPremioService }   from '../../core/services/domain/stock-premio.service';
import { SucursalService }      from '../../core/services/domain/sucursal.service';
import { PremioService }        from '../../core/services/domain/premio.service';
import { ToastService }         from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { ImagenPipe }           from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-stock-premio',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe, FormsModule, SelectSearchComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-premio.component.html',
  styleUrl: './stock-premio.component.css',
})
export class StockPremioComponent implements OnInit {
  private readonly auth      = inject(AuthService);
  private readonly svc       = inject(StockPremioService);
  private readonly sucSvc    = inject(SucursalService);
  private readonly premioSvc = inject(PremioService);
  private readonly toast     = inject(ToastService);

  loading       = signal(false);
  guardando     = signal(false);
  items         = signal<any[]>([]);
  sucursales    = signal<any[]>([]);
  premios       = signal<any[]>([]);
  selSucursal   = signal<any>(null);
  selPremio     = signal<any>(null);

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

  // Inicializar modal
  showIniciarModal = signal(false);
  selNuevoPremio   = signal<any>(null);

  // Ajustar modal
  showAjustarModal = signal(false);
  ajusteItem       = signal<any>(null);
  cantidad         = signal(0);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;

    this.premioSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.premios.set(Array.isArray(r) ? r : (r.content ?? []))
    });

    if (this.isAdmin()) {
      this.sucSvc.getAll({ codempresa: codEmp }).subscribe({
        next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? []))
      });
    } else if (codSuc > 0) {
      this.sucSvc.getById(codSuc).subscribe({
        next: (s: any) => { this.selSucursal.set(s); this.sucursales.set([s]); }
      });
    }

    this.cargar(0);
  }

  cargar(page: number): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.selSucursal()?.codSucursal
      ?? (this.isAdmin() ? 0 : (this.auth.session?.codSucursal ?? 0));
    const codPremio = this.selPremio()?.codPremio ?? 0;

    this.svc.traerStockPorPaginas(codEmp, codSuc, codPremio, page).subscribe({
      next: (r: any) => {
        this.items.set(r.content ?? []);
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar stock'); }
    });
  }

  buscar(): void { this.cargar(0); }

  limpiar(): void {
    this.selSucursal.set(null);
    this.selPremio.set(null);
    this.cargar(0);
  }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    if (p < 0 || p >= this.totalPages()) return;
    this.cargar(p);
  }

  // ── Inicializar stock ──────────────────────────────────────────
  abrirIniciarModal(): void {
    this.selNuevoPremio.set(null);
    this.showIniciarModal.set(true);
  }

  iniciarStock(): void {
    if (!this.selNuevoPremio()) {
      this.toast.error('Seleccione un premio para inicializar');
      return;
    }
    this.guardando.set(true);
    const codEmp    = this.auth.session?.codEmpresa ?? 1;
    const codPremio = this.selNuevoPremio().codPremio;
    this.svc.iniciarstock(codEmp, codPremio).subscribe({
      next: () => {
        this.guardando.set(false);
        this.showIniciarModal.set(false);
        this.toast.success('Stock inicializado correctamente');
        this.cargar(0);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }

  // ── Ajustar stock ──────────────────────────────────────────────
  abrirAjustarModal(item: any): void {
    this.ajusteItem.set(item);
    this.cantidad.set(0);
    this.showAjustarModal.set(true);
  }

  ajustarStock(): void {
    const item = this.ajusteItem();
    if (!item) return;
    if (!this.cantidad() && this.cantidad() !== 0) {
      this.toast.error('Ingrese la cantidad a ajustar');
      return;
    }
    this.guardando.set(true);
    this.svc.ajustarstock(item.codStockPremio, this.cantidad()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.showAjustarModal.set(false);
        this.toast.success('Stock ajustado correctamente');
        this.cargar(this.currentPage());
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }

  isAdmin(): boolean {
    return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false;
  }
}
