import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService }     from '../../core/services/auth.service';
import { CanjeService }    from '../../core/services/domain/canje.service';
import { SucursalService } from '../../core/services/domain/sucursal.service';
import { UsuariosService } from '../../core/services/domain/usuarios.service';
import { ClienteService }  from '../../core/services/domain/cliente.service';
import { ToastService }    from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-canjes-lista',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canjes-lista.component.html',
  styleUrl: './canjes-lista.component.css',
})
export class CanjesListaComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(CanjeService);
  private readonly sucSvc = inject(SucursalService);
  private readonly usSvc  = inject(UsuariosService);
  private readonly cliSvc = inject(ClienteService);
  private readonly toast  = inject(ToastService);

  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  // ── KPI calculado ─────────────────────────────────────
  totalPuntos = computed(() => this.items().reduce((s, c) => s + (c.puntos ?? 0), 0));

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
  estado      = signal('');
  nroCanje    = signal(0);
  sucursales  = signal<any[]>([]);
  usuarios    = signal<any[]>([]);
  clientes    = signal<any[]>([]);
  selSucursal = signal<any>(null);
  selUsuario  = signal<any>(null);
  selCliente  = signal<any>(null);

  showAnularModal = signal(false);
  canjeAnular     = signal<any>(null);
  anulando        = signal(false);

  readonly estadoOpts = ['', 'PENDIENTE', 'CONFIRMADO', 'ANULADO'];

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.usSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.usuarios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    if (codSuc > 0) this.sucSvc.getById(codSuc).subscribe({ next: (s:any) => this.selSucursal.set(s) });
    this.buscar();
  }

  buscar(page = 0): void {
    this.loading.set(true);
    const codSuc = this.selSucursal()?.codSucursal ?? 0;
    this.svc.findByFecha(
      page, this.fechaDesde(), this.fechaHasta(),
      this.selCliente(), this.selUsuario(), codSuc,
      20, this.estado(), null, this.nroCanje()
    ).subscribe({
      next: (r:any) => {
        this.items.set(Array.isArray(r) ? r : (r.content ?? []));
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar canjes'); }
    });
  }

  limpiar(): void {
    this.fechaDesde.set(this._today()); this.fechaHasta.set(this._today());
    this.estado.set(''); this.nroCanje.set(0);
    this.selSucursal.set(null); this.selUsuario.set(null); this.selCliente.set(null);
    this.clientes.set([]);
    this.buscar(0);
  }

  buscarClientes(q: string): void {
    if (!q || q.length < 2) { this.clientes.set([]); return; }
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.cliSvc.getPage(0, q, codEmp).subscribe({
      next: (r: any) => this.clientes.set(Array.isArray(r) ? r : (r?.content ?? [])),
      error: () => {}
    });
  }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.buscar(p); }

  solicitarAnular(canje: any): void { this.canjeAnular.set(canje); this.showAnularModal.set(true); }

  confirmarAnular(): void {
    const c = this.canjeAnular(); if (!c) return;
    this.anulando.set(true);
    this.svc.anular(c.codCanje).subscribe({
      next: () => { this.anulando.set(false); this.showAnularModal.set(false); this.toast.success('Canje anulado'); this.buscar(this.currentPage()); },
      error: (e:any) => { this.anulando.set(false); this.toast.apiError(e); }
    });
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }
  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
