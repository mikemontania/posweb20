// ============================================================
//  DashboardComponent — Angular 20 standalone
//  Migrado desde: ng2-charts + ngx-charts + moment + Bootstrap
//  Reemplazado por: Chart.js 4 nativo + date-fns + CSS puro
//
//  Arquitectura:
//  - Un solo componente (sin sub-componentes para el dashboard)
//  - Signals para todo el estado
//  - Una sola llamada buscar() dispara todas las APIs en paralelo
//  - forkJoin para combinar las 6 llamadas simultáneas
// ============================================================
import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { format } from 'date-fns';

import { AuthService }     from '../../core/services/auth.service';
import { VentasService }   from '../../core/services/domain/ventas.service';
import { CobranzaService } from '../../core/services/domain/cobranza.service';
import { SucursalService } from '../../core/services/domain/sucursal.service';
import { UsuariosService } from '../../core/services/domain/usuarios.service';
import { ToastService }    from '../../shared/components/toast/toast.service';

import { ChartBarComponent }  from '../../shared/components/chart-bar/chart-bar.component';
import { ChartPieComponent }  from '../../shared/components/chart-pie/chart-pie.component';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

import { ResumenSucursal }    from '../../core/models/domain/resumen-sucursal.model';
import { ResumenUsuario }     from '../../core/models/domain/resumen-usuario.model';
import { ResumenMedioPago, ResumenCanal } from '../../core/models/domain/resumen-medio-pago.model';
import { TopProductos }       from '../../core/models/domain/top-productos.model';
import { TopClientes }        from '../../core/models/domain/top-clientes.model';
import { Sucursal }           from '../../core/models/domain/sucursal.model';
import { Usuarios }           from '../../core/models/domain/usuarios.model';

type TipoVista = 'importe' | 'cantidad';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartBarComponent, ChartPieComponent, SelectSearchComponent],
  templateUrl: './dashboard.component.html',
  styleUrl:    './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly auth     = inject(AuthService);
  private readonly ventas   = inject(VentasService);
  private readonly cobranza = inject(CobranzaService);
  private readonly sucSvc   = inject(SucursalService);
  private readonly usuSvc   = inject(UsuariosService);
  private readonly toast    = inject(ToastService);

  // ── Filtros ──────────────────────────────────────────────
  readonly today = format(new Date(), 'yyyy-MM-dd');
  fechaDesde = this.today;
  fechaHasta = this.today;

  sucursales = signal<Sucursal[]>([]);
  usuarios   = signal<Usuarios[]>([]);
  sucursalSel    = signal<number>(0);
  usuarioSel     = signal<number>(0);
  sucursalSelObj = signal<Sucursal | null>(null);
  usuarioSelObj  = signal<Usuarios | null>(null);

  readonly isCajero = computed(() =>
    this.auth.session?.authorities?.[0] === 'ROLE_CAJERO'
  );

  // ── Estado de carga ───────────────────────────────────────
  readonly loading = signal(false);
  readonly cargado = signal(false);

  // ── Datos crudos ──────────────────────────────────────────
  readonly resSucursal  = signal<ResumenSucursal[]>([]);
  readonly resMedioPago = signal<ResumenMedioPago[]>([]);
  readonly resUsuario   = signal<ResumenUsuario[]>([]);
  readonly resReparto   = signal<ResumenSucursal[]>([]);
  readonly resCanal     = signal<ResumenCanal[]>([]);
  readonly topProductos = signal<TopProductos[]>([]);
  readonly topClientes  = signal<TopClientes[]>([]);

  // ── Vista seleccionada por sección ────────────────────────
  readonly tipoSucursal  = signal<TipoVista>('importe');
  readonly tipoMedioPago = signal<TipoVista>('importe');
  readonly tipoUsuario   = signal<TipoVista>('importe');
  readonly tipoReparto   = signal<TipoVista>('importe');
  readonly tipoCanal     = signal<TipoVista>('importe');
  readonly tipoProductos = signal<'importe' | 'cantidad' | 'ventas' | 'peso'>('importe');
  readonly tipoClientes  = signal<TipoVista>('importe');
  readonly limitTop      = signal(20);

  // ── Totales ───────────────────────────────────────────────
  readonly totalSucursalImporte  = computed(() => this.resSucursal().reduce((s, r) => s + r.importeTotal, 0));
  readonly totalSucursalVentas   = computed(() => this.resSucursal().reduce((s, r) => s + r.cantVentas, 0));
  readonly totalMedioPagoImporte = computed(() => this.resMedioPago().reduce((s, r) => s + r.importeCobrado, 0));
  readonly totalMedioPagoQty     = computed(() => this.resMedioPago().reduce((s, r) => s + r.cantCobranzas, 0));
  readonly totalUsuarioImporte   = computed(() => this.resUsuario().reduce((s, r) => s + r.importeTotal, 0));
  readonly totalUsuarioVentas    = computed(() => this.resUsuario().reduce((s, r) => s + r.cantVentas, 0));
  readonly totalProductosImporte = computed(() => this.topProductos().reduce((s, r) => s + r.importeTotal, 0));
  readonly totalClientesImporte  = computed(() => this.topClientes().reduce((s, r) => s + r.importeTotal, 0));

  // ── Datos para gráficos (computed) ────────────────────────
  readonly chartSucursal = computed(() => this.toBarChart(
    this.resSucursal(), 'nombreSucursal',
    this.tipoSucursal() === 'importe' ? 'importeTotal' : 'cantVentas',
    this.tipoSucursal() === 'importe' ? 'Importe GS.' : 'Cant. Ventas'
  ));

  readonly chartMedioPago = computed(() => this.toPieChart(
    this.resMedioPago(), 'medioPago',
    this.tipoMedioPago() === 'importe' ? 'importeCobrado' : 'cantCobranzas'
  ));

  readonly chartUsuario = computed(() => this.toBarChart(
    [...this.resUsuario()].sort((a,b) =>
      this.tipoUsuario() === 'importe'
        ? b.importeTotal - a.importeTotal
        : b.cantVentas - a.cantVentas
    ).slice(0, this.limitTop()),
    'nombrePersona',
    this.tipoUsuario() === 'importe' ? 'importeTotal' : 'cantVentas',
    this.tipoUsuario() === 'importe' ? 'Importe GS.' : 'Cant. Ventas',
    true
  ));

  readonly chartReparto = computed(() => this.toBarChart(
    this.resReparto(), 'nombreSucursal',
    this.tipoReparto() === 'importe' ? 'importeTotal' : 'cantVentas',
    this.tipoReparto() === 'importe' ? 'Importe GS.' : 'Cant. Ventas'
  ));

  readonly chartCanal = computed(() => this.toPieChart(
    this.resCanal(), 'nombreCanal',
    this.tipoCanal() === 'importe' ? 'totalImporte' : 'cantidadClientes'
  ));

  readonly chartProductos = computed(() => {
    const campo = {
      importe: 'importeTotal', cantidad: 'cantidad',
      ventas: 'cantVentas', peso: 'peso'
    }[this.tipoProductos()] as keyof TopProductos;
    const label = {
      importe: 'Importe GS.', cantidad: 'Cantidad',
      ventas: 'Cant. Ventas', peso: 'Peso Kg.'
    }[this.tipoProductos()];
    return this.toBarChart(
      [...this.topProductos()].sort((a,b) => (b[campo] as number) - (a[campo] as number)).slice(0, this.limitTop()),
      'nombreProducto', campo as string, label, true
    );
  });

  readonly chartClientes = computed(() => this.toBarChart(
    [...this.topClientes()].sort((a,b) =>
      this.tipoClientes() === 'importe'
        ? b.importeTotal - a.importeTotal
        : b.cantVentas - a.cantVentas
    ).slice(0, this.limitTop()),
    'razonSocial',
    this.tipoClientes() === 'importe' ? 'importeTotal' : 'cantVentas',
    this.tipoClientes() === 'importe' ? 'Importe GS.' : 'Cant. Ventas',
    true
  ));

  // ── Opciones de límite ────────────────────────────────────
  readonly limites = [5, 10, 15, 20, 30, 50];


  // Getter/setter para ngModel del select de limitTop
  get limitTopValue(): number { return this.limitTop(); }
  set limitTopValue(v: number) { this.limitTop.set(+v); }
  ngOnInit(): void {
    const codEmpresa = this.auth.session?.codEmpresa ?? 1;

    // Si es cajero, fijar su sucursal
    if (this.isCajero()) {
      this.sucursalSel.set(this.auth.session?.codSucursal ?? 0);
    }

    // Cargar sucursales y usuarios
    this.sucSvc.getAll({ codempresa: codEmpresa })
      .subscribe(suc => {
        const todas: Sucursal = {
          codSucursal: 0, nombreSucursal: 'Todas las sucursales',
          codSucursalErp: '', direccion: '', principal: false,
          codEmpresa: 0, modoVendedor: '', latitud: 0, longitud: 0,
          envioposventa: false, mensaje: ''
        };
        this.sucursales.set([todas, ...suc]);
      });

    this.buscar();
  }

  buscar(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.loading.set(true);
    this.cargado.set(false);

    const s = this.sucursalSel();
    const u = this.usuarioSel();

    forkJoin({
      sucursal:  this.ventas.getResumenSucursal(this.fechaDesde, this.fechaHasta, s).pipe(catchError(() => of([]))),
      medioPago: this.cobranza.getResumenMedioPago(this.fechaDesde, this.fechaHasta, u, s).pipe(catchError(() => of([]))),
      usuario:   this.ventas.getResumenUsuario(this.fechaDesde, this.fechaHasta, u, s).pipe(catchError(() => of([]))),
      reparto:   this.ventas.getResumenReparto(this.fechaDesde, this.fechaHasta, s).pipe(catchError(() => of([]))),
      canal:     this.ventas.getResumenCanal(this.fechaDesde, this.fechaHasta, s).pipe(catchError(() => of([]))),
      productos: this.ventas.getTopProductos(this.fechaDesde, this.fechaHasta, u, s).pipe(catchError(() => of([]))),
      clientes:  this.ventas.getTopClientes(this.fechaDesde, this.fechaHasta, u, s).pipe(catchError(() => of([]))),
    }).subscribe({
      next: r => {
        this.resSucursal.set(r.sucursal);
        this.resMedioPago.set(r.medioPago);
        this.resUsuario.set(r.usuario);
        this.resReparto.set(r.reparto);
        this.resCanal.set(r.canal);
        this.topProductos.set(r.productos);
        this.topClientes.set(r.clientes);
        this.loading.set(false);
        this.cargado.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudo cargar el dashboard');
      }
    });

    // Cargar usuarios de la sucursal seleccionada
    if (s > 0) {
      this.usuSvc.getAll({ codsucursal: s }).subscribe(u => {
        const todos: any = { codUsuario: 0, nombrePersona: 'Todos', username: '' };
        this.usuarios.set([todos, ...u]);
      });
    } else {
      this.usuarios.set([]);
      this.usuarioSel.set(0);
    }
  }

  onSucursalChange(suc: Sucursal | null): void {
    this.sucursalSelObj.set(suc);
    this.sucursalSel.set(suc?.codSucursal ?? 0);
    // Resetear usuario al cambiar sucursal
    this.usuarioSelObj.set(null);
    this.usuarioSel.set(0);
  }

  onUsuarioChange(usu: Usuarios | null): void {
    this.usuarioSelObj.set(usu);
    this.usuarioSel.set(usu?.codUsuario ?? 0);
  }

  // ── Formateadores ─────────────────────────────────────────
  formatGs(val: number): string {
    return new Intl.NumberFormat('es-PY', { minimumFractionDigits: 0 }).format(Math.round(val));
  }

  // ── Helpers para gráficos ─────────────────────────────────
  private toBarChart(
    data: any[], labelKey: string, valueKey: string,
    datasetLabel: string, horizontal = false
  ): { labels: string[]; datasets: any[]; horizontal: boolean } {
    return {
      labels:   data.map(d => d[labelKey] ?? ''),
      datasets: [{ label: datasetLabel, data: data.map(d => d[valueKey] ?? 0) }],
      horizontal,
    };
  }

  private toPieChart(data: any[], labelKey: string, valueKey: string) {
    return {
      labels: data.map(d => d[labelKey] ?? ''),
      data:   data.map(d => d[valueKey] ?? 0),
    };
  }
}
