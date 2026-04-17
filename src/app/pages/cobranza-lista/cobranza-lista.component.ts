import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService }       from '../../core/services/auth.service';
import { CobranzaService }   from '../../core/services/domain/cobranza.service';
import { SucursalService }   from '../../core/services/domain/sucursal.service';
import { UsuariosService }   from '../../core/services/domain/usuarios.service';
import { MedioPagoService }  from '../../core/services/domain/medio-pago.service';
import { ToastService }      from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-cobranza-lista',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cobranza-lista.component.html',
  styleUrl: './cobranza-lista.component.css',
})
export class CobranzaListaComponent implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(CobranzaService);
  private readonly sucSvc  = inject(SucursalService);
  private readonly usSvc   = inject(UsuariosService);
  private readonly mpSvc   = inject(MedioPagoService);
  private readonly toast   = inject(ToastService);

  // ── Lista paginada ─────────────────────────────────────
  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  // ── Resumen por medio de pago ──────────────────────────
  resumen = signal<any[]>([]);

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

  // ── Filtros ────────────────────────────────────────────
  fechaDesde   = signal(this._today());
  fechaHasta   = signal(this._today());
  sucursales   = signal<any[]>([]);
  usuarios     = signal<any[]>([]);
  mediosPago   = signal<any[]>([]);
  selSucursal  = signal<any>(null);
  selUsuario   = signal<any>(null);
  selMedioPago = signal<any>(null);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.usSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.usuarios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.mpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.mediosPago.set(Array.isArray(r) ? r : []) });
    if (codSuc > 0) this.sucSvc.getById(codSuc).subscribe({ next: (s: any) => this.selSucursal.set(s) });
    this.buscar();
  }

  buscar(page = 0): void {
    this.loading.set(true);
    const codSuc = this.selSucursal()?.codSucursal ?? 0;
    const codUsr = this.selUsuario()?.codUsuario   ?? 0;
    const codMP  = this.selMedioPago()?.codMedioPago ?? 0;

    // Carga detalles paginados
    this.svc.getDetalleCobranza(
      page, this.fechaDesde(), this.fechaHasta(), codMP, codUsr, codSuc, 20
    ).subscribe({
      next: (r: any) => {
        this.items.set(Array.isArray(r) ? r : (r.content ?? []));
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar cobranzas'); }
    });

    // Carga resumen por medio de pago
    this.svc.getResumenMedioPago(this.fechaDesde(), this.fechaHasta(), codUsr, codSuc)
      .subscribe({ next: (r: any) => this.resumen.set(Array.isArray(r) ? r : []) });
  }

  limpiar(): void {
    this.fechaDesde.set(this._today()); this.fechaHasta.set(this._today());
    this.selSucursal.set(null); this.selUsuario.set(null); this.selMedioPago.set(null);
    this.buscar(0);
  }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.buscar(p); }

  totalResumen(): number { return this.resumen().reduce((s, r) => s + (r.importeCobrado ?? 0), 0); }
  totalCantidad(): number { return this.resumen().reduce((s, r) => s + (r.cantCobranzas ?? 0), 0); }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
