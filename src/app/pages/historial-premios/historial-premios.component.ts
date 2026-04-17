import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }           from '../../core/services/auth.service';
import { HistorialPremioService } from '../../core/services/domain/historial-premio.service';
import { SucursalService }       from '../../core/services/domain/sucursal.service';
import { PremioService }         from '../../core/services/domain/premio.service';
import { ToastService }          from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-historial-premios',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historial-premios.component.html',
  styleUrl: './historial-premios.component.css',
})
export class HistorialPremiosComponent implements OnInit {
  private readonly auth      = inject(AuthService);
  private readonly svc       = inject(HistorialPremioService);
  private readonly sucSvc    = inject(SucursalService);
  private readonly premioSvc = inject(PremioService);
  private readonly toast     = inject(ToastService);

  loading    = signal(false);
  items      = signal<any[]>([]);
  sucursales = signal<any[]>([]);
  premios    = signal<any[]>([]);
  selSucursal = signal<any>(null);
  selPremio   = signal<any>(null);
  fechaDesde  = signal(this._today());

  // paginación client-side
  currentPage = signal(0);
  readonly pageSize = 20;
  totalPages  = computed(() => Math.ceil(this.items().length / this.pageSize) || 1);
  pageItems   = computed(() => {
    const s = this.currentPage() * this.pageSize;
    return this.items().slice(s, s + this.pageSize);
  });
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

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.premioSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.premios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    if (this.isAdmin()) {
      this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    } else if (codSuc > 0) {
      this.sucSvc.getById(codSuc).subscribe({ next: (s: any) => { this.selSucursal.set(s); this.sucursales.set([s]); } });
    }
    this.buscar();
  }

  buscar(): void {
    this.loading.set(true);
    this.currentPage.set(0);
    const codSuc   = this.selSucursal()?.codSucursal ?? (this.isAdmin() ? 0 : (this.auth.session?.codSucursal ?? 0));
    const codPremio = this.selPremio()?.codPremio ?? 0;
    this.svc.getLista(codSuc, codPremio, this.fechaDesde()).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  limpiar(): void {
    this.selSucursal.set(null); this.selPremio.set(null); this.fechaDesde.set(this._today()); this.buscar();
  }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.currentPage.set(p); }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
