import {
  Component, OnInit, OnDestroy, HostListener,
  inject, signal, computed, ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AuthService }        from '../../core/services/auth.service';
import { CanjeService }       from '../../core/services/domain/canje.service';
import { PremioService }      from '../../core/services/domain/premio.service';
import { ClienteService }     from '../../core/services/domain/cliente.service';
import { StockPremioService } from '../../core/services/domain/stock-premio.service';
import { ToastService }       from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { ImagenPipe }         from '../../shared/pipes/imagen.pipe';

import { Premio }     from '../../core/models/domain/premio.model';
import { CanjeDet }   from '../../core/models/domain/canje-det.model';
import { StockPremio } from '../../core/models/domain/stock-premio.model';

@Component({
  selector: 'app-canjes',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe, FormsModule, SelectSearchComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canjes.component.html',
  styleUrl: './canjes.component.css',
})
export class CanjesComponent implements OnInit, OnDestroy {
  private readonly auth      = inject(AuthService);
  private readonly svc       = inject(CanjeService);
  private readonly premioSvc = inject(PremioService);
  private readonly cliSvc    = inject(ClienteService);
  private readonly stockSvc  = inject(StockPremioService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);
  private readonly destroy$  = new Subject<void>();

  // ── Estado de inicialización ─────────────────────────────
  loading   = signal(true);
  guardando = signal(false);

  // ── Cliente ───────────────────────────────────────────────
  cliente                   = signal<any>(null);
  mostrandoBusquedaCliente  = signal(false);
  clientesBusqueda          = signal<any[]>([]);

  // ── Carrito ───────────────────────────────────────────────
  canjeDetalle = signal<CanjeDet[]>([]);
  cantidad     = signal(1);

  // ── Catálogo de premios ───────────────────────────────────
  premios            = signal<Premio[]>([]);
  loadingPremios     = signal(false);
  totalPremios       = signal(0);
  totalPagesPremios  = signal(0);
  currentPagePremios = signal(0);

  // ── Filtros premios ───────────────────────────────────────
  textoBusqueda = signal('');
  puntosDesde   = signal(1);
  puntosHasta   = signal(999999999);

  // ── Modales ───────────────────────────────────────────────
  showConfirmModal      = signal(false);
  showCambioClienteModal = signal(false);

  // ── Computed ──────────────────────────────────────────────
  totalPuntosDetalle = computed(() =>
    this.canjeDetalle().reduce((sum, d) => sum + d.totalPuntos, 0)
  );

  puntosRestantes = computed(() => {
    const cli = this.cliente();
    return cli ? (cli.puntos ?? 0) - this.totalPuntosDetalle() : 0;
  });

  pageNumbers = computed(() => {
    const total = this.totalPagesPremios(), cur = this.currentPagePremios();
    if (total <= 0) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  readonly sinImagen = 'assets/images/sin-imagen.jpg';

  // ── Mobile tab ────────────────────────────────────────────
  tabActivo: 'catalogo' | 'carrito' = 'catalogo';

  private readonly searchPremio$ = new Subject<string>();

  // ── Limpiar stock comprometido al salir del navegador ─────
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    const detalle = this.canjeDetalle();
    if (detalle.length > 0) this.cancelarStockComprometido(detalle);
  }

  ngOnInit(): void {
    // Debounce para búsqueda de premios al escribir
    this.searchPremio$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      this.currentPagePremios.set(0);
      this.cargarPremios(0, term);
    });

    this.inicializar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    const detalle = this.canjeDetalle();
    if (detalle.length > 0) this.cancelarStockComprometido(detalle);
  }

  // ── Carga inicial ─────────────────────────────────────────

  async inicializar(): Promise<void> {
    this.loading.set(true);
    try {
      const clienteDefault = await firstValueFrom(this.cliSvc.getClienteDefault());
      this.cliente.set(clienteDefault);
    } catch {
      this.toast.error('No existe cliente predeterminado configurado');
      this.router.navigate(['/dashboard']);
      return;
    } finally {
      this.loading.set(false);
    }
    this.cargarPremios(0, '');
  }

  // ── Premios ───────────────────────────────────────────────

  cargarPremios(page: number, termino: string): void {
    this.loadingPremios.set(true);
    const codEmpresa = this.auth.session?.codEmpresa ?? 1;
    this.premioSvc.getPage(page, termino, codEmpresa, {
      puntosdesde: this.puntosDesde(),
      puntoshasta: this.puntosHasta(),
    }).subscribe({
      next: (r: any) => {
        this.premios.set(Array.isArray(r) ? r : (r.content ?? []));
        this.totalPremios.set(r.totalElements ?? 0);
        this.totalPagesPremios.set(r.totalPages ?? 1);
        this.currentPagePremios.set(r.number ?? page);
        this.loadingPremios.set(false);
      },
      error: () => {
        this.loadingPremios.set(false);
        this.toast.error('Error al cargar premios');
      },
    });
  }

  onBusquedaChange(val: string): void {
    const upper = val.toUpperCase();
    this.textoBusqueda.set(upper);
    this.searchPremio$.next(upper);
  }

  filtrarPremios(): void {
    this.currentPagePremios.set(0);
    this.cargarPremios(0, this.textoBusqueda());
  }

  irPagina(p: number | '...'): void {
    if (typeof p === 'number') this.cargarPremios(p, this.textoBusqueda());
  }

  // ── Carrito ───────────────────────────────────────────────

  cambiarCantidad(delta: number): void {
    const nueva = this.cantidad() + delta;
    if (nueva < 1) return;
    this.cantidad.set(nueva);
  }

  async seleccionarPremio(premio: Premio): Promise<void> {
    if (this.cantidad() <= 0) {
      this.toast.warning('La cantidad debe ser mayor a 0');
      return;
    }
    const codSucursal = this.auth.session?.codSucursal ?? 0;
    const qty = this.cantidad();

    if (premio.inventariable) {
      const stock = await this.getStock(codSucursal, premio.codPremio);
      if (!stock || stock.existencia <= 0) {
        this.toast.error('El premio inventariable no posee stock');
        return;
      }
      const disponible = stock.existencia - stock.comprometido;
      if (qty > disponible) {
        this.toast.error(`Sin stock suficiente. Disponible: ${disponible}`);
        return;
      }
      this.stockSvc.updateStock({ ...stock, comprometido: stock.comprometido + qty }).subscribe();
    }

    const detalle = [...this.canjeDetalle()];
    const idx = detalle.findIndex(d => d.premio.codPremio === premio.codPremio);

    if (idx === -1) {
      detalle.push({
        codCanjeDet: null as any,
        premio,
        cantidad: qty,
        puntos: premio.puntos,
        totalPuntos: premio.puntos * qty,
        canje: null,
      });
    } else {
      const nueva_cantidad = detalle[idx].cantidad + qty;
      detalle[idx] = {
        ...detalle[idx],
        cantidad: nueva_cantidad,
        totalPuntos: nueva_cantidad * detalle[idx].puntos,
      };
    }
    this.canjeDetalle.set(detalle);
    this.cantidad.set(1);
  }

  async restarPremio(item: CanjeDet): Promise<void> {
    if (item.cantidad <= 1) return;
    const codSucursal = this.auth.session?.codSucursal ?? 0;
    if (item.premio.inventariable) {
      const stock = await this.getStock(codSucursal, item.premio.codPremio);
      if (stock) {
        this.stockSvc.updateStock({ ...stock, comprometido: Math.max(0, stock.comprometido - 1) }).subscribe();
      }
    }
    this.canjeDetalle.set(
      this.canjeDetalle().map(d =>
        d.premio.codPremio === item.premio.codPremio
          ? { ...d, cantidad: d.cantidad - 1, totalPuntos: (d.cantidad - 1) * d.puntos }
          : d
      )
    );
  }

  async quitarPremioCompleto(item: CanjeDet): Promise<void> {
    const codSucursal = this.auth.session?.codSucursal ?? 0;
    if (item.premio.inventariable) {
      const stock = await this.getStock(codSucursal, item.premio.codPremio);
      if (stock) {
        this.stockSvc.updateStock({ ...stock, comprometido: Math.max(0, stock.comprometido - item.cantidad) }).subscribe();
      }
    }
    this.canjeDetalle.set(
      this.canjeDetalle().filter(d => d.premio.codPremio !== item.premio.codPremio)
    );
  }

  // ── Cliente ───────────────────────────────────────────────

  buscarClientes(q: string): void {
    if (!q || q.length < 2) { this.clientesBusqueda.set([]); return; }
    const codEmpresa = this.auth.session?.codEmpresa ?? 1;
    this.cliSvc.getPage(0, q, codEmpresa).subscribe({
      next: (r: any) => this.clientesBusqueda.set(Array.isArray(r) ? r : (r?.content ?? [])),
      error: () => {},
    });
  }

  seleccionarCliente(cli: any): void {
    if (!cli) return;
    this.cliente.set(cli);
    this.mostrandoBusquedaCliente.set(false);
    this.clientesBusqueda.set([]);
  }

  verificarCambioCliente(): void {
    if (this.canjeDetalle().length > 0) {
      this.showCambioClienteModal.set(true);
    } else {
      this.activarBusquedaCliente();
    }
  }

  confirmarCambioCliente(): void {
    this.showCambioClienteModal.set(false);
    this.cancelarStockComprometido(this.canjeDetalle());
    this.canjeDetalle.set([]);
    this.activarBusquedaCliente();
  }

  cancelarCambioCliente(): void {
    this.showCambioClienteModal.set(false);
  }

  private activarBusquedaCliente(): void {
    this.mostrandoBusquedaCliente.set(true);
    this.clientesBusqueda.set([]);
  }

  // ── Guardar canje ─────────────────────────────────────────

  solicitarGuardar(): void {
    const cli = this.cliente();
    if (!cli) {
      this.toast.error('No se ha seleccionado ningún cliente');
      return;
    }
    if (cli.predeterminado) {
      this.toast.error('Cliente mostrador no puede realizar canje');
      return;
    }
    if (cli.esPropietario) {
      this.toast.error('Cliente propietario no puede realizar canje');
      return;
    }
    if (this.canjeDetalle().length === 0) {
      this.toast.error('No se han seleccionado premios');
      return;
    }
    if (this.totalPuntosDetalle() > (cli.puntos ?? 0)) {
      this.toast.error('Puntaje insuficiente para realizar el canje');
      return;
    }
    this.showConfirmModal.set(true);
  }

  confirmarGuardar(): void {
    this.showConfirmModal.set(false);
    const session = this.auth.session;
    const cli = this.cliente();
    const payload = {
      canje: {
        codCanje: null,
        anulado: false,
        codEmpresaErp:    session?.codEmpresaErp    ?? '',
        codSucursalErp:   session?.codSucursalErp   ?? '',
        codEmpresa:       session?.codEmpresa       ?? 0,
        codSucursal:      session?.codSucursal      ?? 0,
        estado:           'TEMP',
        fechaAnulacion:   null,
        fechaCreacion:    null,
        fechaCanje:       new Date().toISOString().slice(0, 10),
        fechaModificacion: null,
        puntos:           this.totalPuntosDetalle(),
        nroCanje:         0,
        codUsuarioAnulacion: null,
        codUsuarioCreacion:  session?.codUsuario ?? null,
        cliente:          cli,
        detalle:          this.canjeDetalle(),
      },
    };

    this.guardando.set(true);
    this.svc.create(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(
          `${cli.concatCodErpNombre ?? cli.razonSocial} canjeó ${this.totalPuntosDetalle()} puntos`,
          { title: 'Canje realizado con éxito' }
        );
        this.limpiar();
      },
      error: (e: any) => {
        this.guardando.set(false);
        this.toast.apiError(e);
      },
    });
  }

  cancelarGuardar(): void {
    this.showConfirmModal.set(false);
  }

  async limpiar(): Promise<void> {
    const detalle = this.canjeDetalle();
    if (detalle.length > 0) this.cancelarStockComprometido(detalle);
    this.canjeDetalle.set([]);
    this.cantidad.set(1);
    this.textoBusqueda.set('');
    this.puntosDesde.set(1);
    this.puntosHasta.set(999999999);
    this.mostrandoBusquedaCliente.set(false);
    this.clientesBusqueda.set([]);
    await this.inicializar();
  }

  // ── Helpers privados ──────────────────────────────────────

  private async getStock(codSucursal: number, codPremio: number): Promise<StockPremio | null> {
    try {
      return await firstValueFrom(this.stockSvc.traerStockCanje(codSucursal, codPremio));
    } catch {
      return null;
    }
  }

  private cancelarStockComprometido(detalle: CanjeDet[]): void {
    const inventariables = detalle.filter(d => d.premio.inventariable);
    if (inventariables.length === 0) return;
    const codSucursal = this.auth.session?.codSucursal ?? 0;
    this.stockSvc.cancelarComprometido(codSucursal, inventariables).subscribe();
  }
}
