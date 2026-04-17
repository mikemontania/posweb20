// VentasComponent — solo coordina UI y delega todo al Facade
// Sin lógica de negocio ni HTTP.
import {
  Component, OnInit, OnDestroy, HostListener, inject,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { VentasStateService }  from './ventas-state.service';
import { VentasFacadeService } from './ventas-facade.service';

import { PosCatalogoComponent } from '../../shared/components/pos/pos-catalogo.component';
import { PosDetalleComponent }  from '../../shared/components/pos/pos-detalle.component';
import { PosTotalesComponent }  from '../../shared/components/pos/pos-totales.component';
import { PosClienteComponent }  from '../../shared/components/pos/pos-cliente.component';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { PosCobranzaComponent } from '../../shared/components/pos/pos-cobranza.component';

@Component({
  selector: 'app-ventas',
  standalone: true,
  providers: [VentasStateService, VentasFacadeService],
  imports: [
    CommonModule, FormsModule, SelectSearchComponent,
    PosCatalogoComponent, PosDetalleComponent,
    PosTotalesComponent, PosClienteComponent, PosCobranzaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ventas.component.html',
  styleUrl:    './ventas.component.css',
})
export class VentasComponent implements OnInit, OnDestroy {

  protected esObsequio = false;   // ObsequiosComponent lo sobreescribe a true

  readonly st     = inject(VentasStateService);
  readonly facade = inject(VentasFacadeService);
  private  cdr    = inject(ChangeDetectorRef);

  // ── Tab móvil
  tabActivo: 'catalogo' | 'carrito' = 'catalogo';

  // ── Estado de recuperación — se evalúa una sola vez al iniciar ──
  /** Hay un draft guardado del carrito (corte de luz, cierre de browser, etc.) */
  hayDraft    = false;
  /** Hay una venta que falló al enviarse y puede reintentarse */
  hayPending  = false;

  // Categoría activa del catálogo — se mantiene al buscar y paginar
  private catActivaCod = 0;
  private busquedaActual = '';

  // Filtro cliente en modal pedidos
  clientePedidoFiltro: any = null;

  // Paginación del modal de pedidos
  paginaPedidos = 1;

  get totalPagesPedidos(): number {
    return Math.ceil(this.st.totalPedidos() / 20);
  }

  get pageNumsPedidos(): (number | '...')[] {
    const t = this.totalPagesPedidos, c = this.paginaPedidos;
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    const r: (number | '...')[] = [1];
    if (c > 3) r.push('...');
    for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) r.push(i);
    if (c < t - 2) r.push('...');
    r.push(t);
    return r;
  }

  // Búsqueda de clientes con debounce
  readonly buscarCli$ = new Subject<string>();
  private  destroy$   = new Subject<void>();

  // Estado local modal pedidos
  fechaInicio  = new Date().toISOString().slice(0, 10);
  fechaFin     = new Date().toISOString().slice(0, 10);
  nroPedido    = 0;

  // Estado local modal cupón
  codigoCupon   = '';
  alertaCupon   = '';
  cuponTemp: any = null;

  codigoInfluencer      = '';
  alertaInfluencerCupon = '';
  cuponInfluencerTemp: any = null;

  /**
   * Captura el cierre del browser/pestaña para cancelar el stock comprometido.
   * ngOnDestroy solo dispara al navegar dentro de la app — no al cerrar la pestaña.
   * Idéntico a ng12 beforeUnloadHander().
   */
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.facade.cancelarStockAlSalir();
    // saveDraft es async pero beforeunload no puede hacer await
    // IDB es lo suficientemente rápido para completar antes de que el browser cierre
    this.facade.draft.saveDraft({
      detalles:            this.facade.st.ventaDetalles(),
      descuentos:          this.facade.st.descuentos(),
      porcentajeDescuento: this.facade.st.porcentajeDescuento(),
      cliente:             this.facade.st.cliente(),
      canal:               this.facade.st.canal(),
      modoEntrega:         this.facade.st.venta()?.modoEntrega ?? 'CONTRA_ENTREGA',
      listaPrecio:         this.facade.st.listaPrecio(),
      formaVenta:          this.facade.st.formaVenta(),
      vendedor:            this.facade.st.vendedor(),
      cuponPromo:          this.facade.st.cuponPromo(),
      pedido:              this.facade.st.pedido(),
    });
  }

  ngOnInit(): void {
    this.facade.setEsObsequio(this.esObsequio);

    // Detectar si hay datos guardados de sesiones anteriores
    // hasDraft/hasPending son async con IndexedDB
    this.facade.hasDraft().then(v   => { this.hayDraft   = v; this.cdr.markForCheck(); });
    this.facade.hasPending().then(v => { this.hayPending = v; this.cdr.markForCheck(); });

    this.buscarCli$.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(q => this.facade.buscarClientes(q).then(() => this.cdr.markForCheck()));

    this.facade.initTerminal();
  }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
    this.facade.cancelarStockAlSalir();
  }

  // ── Callbacks del cliente ─────────────────────────────────
  onClienteSeleccionado(item: any): void {
    this.facade.seleccionarCliente(item).then(() => this.cdr.markForCheck());
  }

  onBuscarCliente(q: string): void { this.buscarCli$.next(q); }

  onCancelarBusqueda(): void {
    // Volver al cliente anterior sin perder nada
    this.facade.cancelarCambiocliente();
    this.cdr.markForCheck();
  }

  /** Abrir formulario de nuevo cliente en nueva pestaña — idéntico a ng12 mostrarModalCliente() */
  onCrearCliente(): void {
    window.open('/clientes/formulario/new', '_blank');
  }

  onVerificarVenta(): void {
    if ((this.st.venta()?.importeTotal ?? 0) > 0) {
      if (!confirm('¿Desea cambiar de cliente? Los detalles se guardarán temporalmente.')) return;
      this.facade.guardarDetallesTemporal().then(() => this.cdr.markForCheck());
    } else {
      this.facade.cambiarCliente();
      this.cdr.markForCheck();
    }
  }

  // ── Callbacks del catálogo ────────────────────────────────
  onProductoClick(ev: { producto: any; cantidad: number }): void {
    this.facade.seleccionarProducto(ev.producto, ev.cantidad).then(() => {
      // En móvil: al agregar un producto, cambiar al carrito automáticamente
      if (window.innerWidth <= 768) {
        this.tabActivo = 'carrito';
      }
      this.cdr.markForCheck();
    });
  }
  onBusquedaChange(q: string): void {
    this.busquedaActual = q;
    this.facade.cargarProductos(0, q, this.catActivaCod);
  }
  onCategoriaChange(cat: any): void {
    this.catActivaCod = cat?.codCategoriaProducto ?? 0;
    this.facade.cargarProductos(0, this.busquedaActual, this.catActivaCod);
  }
  onPageChange(p: number): void {
    this.facade.cargarProductos(p - 1, this.busquedaActual, this.catActivaCod);
  }

  onTerminalChange(value: number) {
    const terminal = this.st.terminales().find(x => x.codTerminalVenta == value) ?? null;
    this.st.terminal.set(terminal);
  }

  // ── Callbacks del detalle ─────────────────────────────────
  onRestar(item: any): void  { this.facade.restarProducto(item).then(() => this.cdr.markForCheck()); }
  onQuitar(item: any): void  { this.facade.quitarProductoCompleto(item).then(() => this.cdr.markForCheck()); }
  onAgregar(prod: any): void { this.facade.seleccionarProducto(prod, 1).then(() => this.cdr.markForCheck()); }
  onQuitarDescuento(d: any): void { this.facade.quitarDescuento(d).then(() => this.cdr.markForCheck()); }

  // ── Guardar / Cobranza ────────────────────────────────────
  onGuardar(): void {
    this.facade.definirFormaPago().then(() => this.cdr.markForCheck());
  }
  onCobranzaGuardada(ev: any): void {
    this.facade.onCobranzaGuardada(ev).then(() => this.cdr.markForCheck());
  }
  onCancelarCobranza(): void { this.facade.cancelarCobranza(); this.cdr.markForCheck(); }

  // ── Selección forma / canal ───────────────────────────────
  onCambioForma(cod: number): void { this.facade.cambioForma(cod); this.cdr.markForCheck(); }
  onCambioCanal(cod: number): void { this.facade.setCanalByCod(cod); this.cdr.markForCheck(); }

  // ── Terminal ──────────────────────────────────────────────
  onGuardarTerminal(cod: number): void {
    this.facade.guardarTerminal(cod).then(() => this.cdr.markForCheck());
  }
  onCerrarTerminal(): void { this.st.modalTerminal.set(false); inject(Router).navigate(['/dashboard']); }

  // ── Pedidos ───────────────────────────────────────────────
  onAbrirPedidos(): void { this.facade.abrirModalPedidos().then(() => this.cdr.markForCheck()); }
  onBuscarPedido(): void {
    this.facade.buscarPedidos(this.fechaInicio, this.fechaFin, this.nroPedido, this.clientePedidoFiltro)
      .then(() => this.cdr.markForCheck());
  }

  onBuscarClientePedido(q: string): void { this.buscarCli$.next(q); }

  onPaginaPedidos(p: number): void {
    if (p < 1 || p > this.totalPagesPedidos) return;
    this.paginaPedidos = p;
    this.facade.cargarPaginaPedidos(p - 1, this.fechaInicio, this.fechaFin, this.clientePedidoFiltro, this.nroPedido)
      .then(() => this.cdr.markForCheck());
  }

  onClientePedidoFiltro(cli: any): void {
    this.clientePedidoFiltro = cli ?? null;
  }
  onSeleccionarPedido(p: any): void { this.facade.seleccionarPedido(p).then(() => this.cdr.markForCheck()); }

  // ── Cupones ───────────────────────────────────────────────
  onValidarCupon(): void {
    if (!this.codigoCupon?.trim()) return;
    this.facade.validarCupon(this.codigoCupon).then(({ alerta, cuponPromo }) => {
      this.alertaCupon = alerta;
      this.cuponTemp   = cuponPromo;
      this.cdr.markForCheck();
    });
  }

  onUsarCupon(): void {
    if (!this.cuponTemp) return;
    this.facade.usarCupon(this.cuponTemp).then(() => {
      this.alertaCupon = '';
      this.cuponTemp   = null;
      this.cdr.markForCheck();
    });
  }

  onValidarInfluencer(): void {
    if (!this.codigoInfluencer?.trim()) return;
    this.facade.validarInfluencer(this.codigoInfluencer).then(({ alerta, cuponPromo }) => {
      this.alertaInfluencerCupon  = alerta;
      this.cuponInfluencerTemp    = cuponPromo;
      this.cdr.markForCheck();
    });
  }

  onUsarInfluencer(): void {
    if (!this.cuponInfluencerTemp) return;
    this.facade.usarInfluencerCupon(this.cuponInfluencerTemp).then(() => {
      this.alertaInfluencerCupon  = '';
      this.cuponInfluencerTemp    = null;
      this.cdr.markForCheck();
    });
  }

  // ── Cancelar ──────────────────────────────────────────────
  onCancelar(): void { this.facade.limpiar(); this.cdr.markForCheck(); }

  /** Restaurar el carrito desde el draft guardado */
  onRestaurarDraft(): void {
    this.facade.draft.loadDraft().then(async draft => {
      if (!draft) return;
      this.facade.st.ventaDetalles.set(draft.detalles ?? []);
      this.facade.st.descuentos.set(draft.descuentos ?? []);
      this.facade.st.porcentajeDescuento.set(draft.porcentajeDescuento ?? 0);
      if (draft.cliente)     this.facade.st.cliente.set(draft.cliente);
      if (draft.canal)       this.facade.st.canal.set(draft.canal);
      if (draft.listaPrecio) this.facade.st.listaPrecio.set(draft.listaPrecio);
      if (draft.formaVenta)  this.facade.st.formaVenta.set(draft.formaVenta);
      if (draft.vendedor)    this.facade.st.vendedor.set(draft.vendedor);
      if (draft.cuponPromo)  this.facade.st.cuponPromo.set(draft.cuponPromo);
      this.facade.draft.clearDraft();
      // Recalcular totales ANTES de mostrar — sin esto importeTotal queda en 0
      // y onVerificarVenta() toma el camino rápido que borra los items sin preguntar
      await this.facade.reHacerVenta();
      this.facade.st.mostrarCliente.set(true);
      this.facade.st.buscadorHabilitado.set(true);
      this.hayDraft = false;
      this.cdr.markForCheck();
    });
  }

  /** Descartar el draft sin restaurar */
  onDescartarDraft(): void {
    this.facade.draft.clearDraft();
    this.hayDraft = false;
    this.cdr.markForCheck();
  }

  /**
   * Restaura la venta pendiente en pantalla para que el vendedor
   * la verifique y la guarde manualmente. No reenvía automáticamente.
   */
  onRestaurarPending(): void {
    this.facade.restaurarPending().then(ok => {
      if (ok) {
        this.hayPending = false;
        this.cdr.markForCheck();
      }
    });
  }

  /** Descartar la venta pendiente sin reintentar */
  onDescartarPending(): void {
    this.facade.draft.clearPending();
    this.hayPending = false;
    this.cdr.markForCheck();
  }

  // Helpers
  trackByProd  = (_: number, p: any) => p.codProducto;
  trackByDesc  = (i: number) => i;
}