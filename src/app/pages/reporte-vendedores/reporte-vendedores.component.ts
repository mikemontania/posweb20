import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService }       from '../../core/services/auth.service';
import { VentasService }     from '../../core/services/domain/ventas.service';
import { SucursalService }   from '../../core/services/domain/sucursal.service';
import { VendedorService }   from '../../core/services/domain/vendedor.service';
import { ToastService }      from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-reporte-vendedores',
  standalone: true,
  imports: [FormsModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reporte-vendedores.component.html',
  styleUrl: './reporte-vendedores.component.css',
})
export class ReporteVendedoresComponent implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly ventasSvc  = inject(VentasService);
  private readonly sucSvc     = inject(SucursalService);
  private readonly vendSvc    = inject(VendedorService);
  private readonly toast      = inject(ToastService);

  cargando    = signal(false);
  sucursales  = signal<any[]>([]);
  vendedores  = signal<any[]>([]);
  selSucursal = signal<any>(null);
  selVendedor = signal<any>(null);
  fechaDesde  = signal(this._today());
  fechaHasta  = signal(this._today());

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.vendSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.vendedores.set(Array.isArray(r) ? r : (r.content ?? [])) });
    if (this.isAdmin()) {
      this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    } else if (codSuc > 0) {
      this.sucSvc.getById(codSuc).subscribe({ next: (s: any) => { this.selSucursal.set(s); this.sucursales.set([s]); } });
    }
  }

  verReporte(): void {
    this.cargando.set(true);
    const codEmp      = this.auth.session?.codEmpresa ?? 1;
    const codSucursal = this.selSucursal()?.codSucursal ?? (this.auth.session?.codSucursal ?? 0);
    const codVendedor = this.selVendedor()?.codVendedor ?? 0;
    this.ventasSvc.verReporteVendedoresPdf(this.fechaDesde(), this.fechaHasta(), codEmp, codSucursal, codVendedor).subscribe({
      next: (blob: Blob) => {
        this.cargando.set(false);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      },
      error: () => { this.cargando.set(false); this.toast.error('Error al generar reporte'); }
    });
  }

  limpiar(): void {
    this.selSucursal.set(null); this.selVendedor.set(null);
    this.fechaDesde.set(this._today()); this.fechaHasta.set(this._today());
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }
  isCajero(): boolean {
    const roles = this.auth.session?.authorities ?? [];
    return roles.includes('ROLE_CAJERO') || roles.includes('ROLE_CAJERO_SUP') || this.isAdmin();
  }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
