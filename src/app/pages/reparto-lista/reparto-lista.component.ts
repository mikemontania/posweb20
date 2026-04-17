import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }     from '../../core/services/auth.service';
import { SearchStateService } from '../../core/services/search-state.service';
import { RepartoService }  from '../../core/services/domain/reparto.service';
import { SucursalService } from '../../core/services/domain/sucursal.service';
import { ChoferService }   from '../../core/services/domain/chofer.service';
import { VehiculoService } from '../../core/services/domain/vehiculo.service';
import { ToastService }    from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-reparto-lista',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterModule, SelectSearchComponent, ModalConfirmComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reparto-lista.component.html',
  styleUrl: './reparto-lista.component.css',
})
export class RepartoListaComponent implements OnInit {
  private readonly auth      = inject(AuthService);
  private readonly stateSvc  = inject(SearchStateService);
  private readonly router    = inject(Router);
  private readonly svc       = inject(RepartoService);
  private readonly sucSvc    = inject(SucursalService);
  private readonly choferSvc = inject(ChoferService);
  private readonly vehSvc    = inject(VehiculoService);
  private readonly toast     = inject(ToastService);

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

  fechaDesde  = signal(this._today());
  fechaHasta  = signal(this._today());
  sucursales  = signal<any[]>([]);
  choferes    = signal<any[]>([]);
  vehiculos   = signal<any[]>([]);
  selSucursal = signal<any>(null);
  selChofer   = signal<any>(null);
  selVehiculo = signal<any>(null);

  showAnularModal = signal(false);
  repartoAnular   = signal<any>(null);
  anulando        = signal(false);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.choferSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.choferes.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.vehSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.vehiculos.set(Array.isArray(r) ? r : (r.content ?? [])) });

    const saved = this.stateSvc.get('reparto-lista');
    if (saved) {
      this.fechaDesde.set(saved.fechaDesde);
      this.fechaHasta.set(saved.fechaHasta);
      this.selSucursal.set(saved.selSucursal);
      this.selChofer.set(saved.selChofer);
      this.selVehiculo.set(saved.selVehiculo);
      this.buscar(saved.page ?? 0);
    } else {
      if (codSuc > 0) this.sucSvc.getById(codSuc).subscribe({ next: (s:any) => this.selSucursal.set(s) });
      this.buscar();
    }
  }

  buscar(page = 0): void {
    this.stateSvc.save('reparto-lista', {
      fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta(),
      selSucursal: this.selSucursal(), selChofer: this.selChofer(),
      selVehiculo: this.selVehiculo(), page,
    });
    this.loading.set(true);
    const codSuc = this.selSucursal()?.codSucursal ?? 0;
    this.svc.findByFecha(page, this.fechaDesde(), this.fechaHasta(), codSuc)
      .subscribe({
        next: (r:any) => {
          let data: any[] = Array.isArray(r) ? r : (r.content ?? []);
          // Filtrado local por chofer/vehículo si están seleccionados
          if (this.selChofer()) {
            data = data.filter(d => d.chofer?.codChofer === this.selChofer().codChofer);
          }
          if (this.selVehiculo()) {
            data = data.filter(d => d.vehiculo?.codVehiculo === this.selVehiculo().codVehiculo);
          }
          this.items.set(data);
          this.totalElements.set(r.totalElements ?? data.length);
          this.totalPages.set(r.totalPages ?? 1);
          this.currentPage.set(r.number ?? page);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar repartos'); }
      });
  }

  limpiar(): void {
    this.stateSvc.clear('reparto-lista');
    this.fechaDesde.set(this._today()); this.fechaHasta.set(this._today());
    this.selSucursal.set(null); this.selChofer.set(null); this.selVehiculo.set(null);
    this.buscar(0);
  }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.buscar(p); }

  solicitarAnular(r: any): void { this.repartoAnular.set(r); this.showAnularModal.set(true); }

  confirmarAnular(): void {
    const r = this.repartoAnular(); if (!r) return;
    this.anulando.set(true);
    this.svc.anular(r.codReparto).subscribe({
      next: () => { this.anulando.set(false); this.showAnularModal.set(false); this.toast.success('Reparto anulado'); this.buscar(this.currentPage()); },
      error: (e:any) => { this.anulando.set(false); this.toast.apiError(e); }
    });
  }

  verDocs(r: any): void {
    this.router.navigate(['/reparto-docs', r.codReparto, r.codSucursal]);
  }

  verPdfDetalle(r: any): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.svc.verReporteDetallePdf(r.fechaReparto, codEmp, r.codReparto).subscribe({
      next: (blob: Blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.toast.error('Error al generar PDF')
    });
  }

  verPdfDocs(r: any): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.svc.verReporteDocsPdf(r.fechaReparto, codEmp, r.codReparto).subscribe({
      next: (blob: Blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.toast.error('Error al generar PDF')
    });
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }
  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
