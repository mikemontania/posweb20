import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

import { PedidosFacadeService }  from './pedidos-facade.service';
import { PedidosStateService }   from './pedidos-state.service';
import { PosCatalogoComponent }  from '../../shared/components/pos/pos-catalogo.component';
import { PosDetalleComponent }   from '../../shared/components/pos/pos-detalle.component';
import { PosTotalesComponent }   from '../../shared/components/pos/pos-totales.component';
import { PosClientePedidoComponent } from '../../shared/components/pos/pos-cliente-pedido.component';
import { PosCobranzaComponent }  from '../../shared/components/pos/pos-cobranza.component';
import { ClientesForm }          from '../clientes/clientes-form.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  providers: [PedidosStateService, PedidosFacadeService],
  imports: [
    DatePipe, DecimalPipe, FormsModule, SelectSearchComponent,
    PosCatalogoComponent, PosDetalleComponent,
    PosTotalesComponent, PosClientePedidoComponent, PosCobranzaComponent,
    ClientesForm,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pedidos.component.html',
  styleUrl:    './pedidos.component.css',
})
export class PedidosComponent implements OnInit {
  readonly f   = inject(PedidosFacadeService);
  readonly st  = inject(PedidosStateService);
  readonly cdr = inject(ChangeDetectorRef);

  tabActivo: 'carrito' | 'catalogo' = 'catalogo';

  async ngOnInit(): Promise<void> {
    await this.f.init();
    this.cdr.markForCheck();
  }

  // ── pos-catalogo — FIX: usar ev.cantidad emitido por el componente ─────────
  onProductoClick(ev: { producto: any; cantidad: number }): void {
    this.f.seleccionarProducto(ev.producto, ev.cantidad).then(() => {
      this.tabActivo = 'carrito';
      this.cdr.markForCheck();
    });
  }

  onPageChange(p: number): void {
    this.st.pagina.set(p);
    this.f.traerProductos(p, '', this.st.categoriaSeleccionada()?.codCategoriaProducto ?? 0);
  }

  onBusquedaChange(q: string): void {
    this.st.pagina.set(0);
    this.f.buscarProducto(q);
    this.cdr.markForCheck();
  }

  onCategoriaChange(cat: any): void {
    this.f.filtrarCategoria(cat);
    this.cdr.markForCheck();
  }

  // ── pos-cliente ───────────────────────────────────────────────────────────
  onClienteSeleccionado(c: any): void {
    this.f.seleccionarCliente(c).then(() => this.cdr.markForCheck());
  }

  onBuscarClick(): void {
    this.f.verificarPedido();
    this.cdr.markForCheck();
  }

  onPedidoClick(): void {
    // botón "cargar pedido" (lápiz en ng12)
    this.f.mostrarModalPedidos().then(() => this.cdr.markForCheck());
  }

  // ── pos-detalle ───────────────────────────────────────────────────────────
  onRestar(item: any): void {
    this.f.restarProducto(item).then(() => this.cdr.markForCheck());
  }

  onAgregarUno(item: any): void {
    // pos-detalle emite el detalle — tomamos el producto, cantidad = 1
    this.f.seleccionarProducto(item.producto ?? item, 1).then(() => this.cdr.markForCheck());
  }

  onQuitar(item: any): void {
    this.f.quitarProductoCompleto(item).then(() => this.cdr.markForCheck());
  }

  onQuitarDesc(d: any): void {
    this.f.quitarDescuento(d).then(() => this.cdr.markForCheck());
  }

  // ── pos-cobranza ──────────────────────────────────────────────────────────
  onGuardarCobranza(payload: any): void {
    this.f.guardarCobranzaConPayload(payload);
    this.cdr.markForCheck();
  }

  onCerrarCobranza(): void {
    this.f.cancelarModal();
    this.cdr.markForCheck();
  }

  // ── Acciones principales ──────────────────────────────────────────────────
  onGuardar(): void {
    this.f.verificarTipoPedido().then(() => this.cdr.markForCheck());
  }

  onCancelar(): void {
    if (this.st.pedidoDetalles().length > 0) {
      if (!confirm('¿Cancelar el pedido? Se perderán los datos.')) return;
    }
    this.f.limpiar();
    this.f.init().then(() => this.cdr.markForCheck());
  }

  // ── Canal / Sucursal ──────────────────────────────────────────────────────
  getSucursalById(codSucursal: any): any {
    return this.st.sucursales().find(s => s.codSucursal == codSucursal) ?? null;
  }

  getCanalById(codCanal: any): any {
    return this.st.canales().find(c => c.codCanal == codCanal) ?? null;
  }

  onCanalChange(canal: any): void {
    this.f.cambioCanal(canal);
    this.cdr.markForCheck();
  }

  onSucursalChange(suc: any): void {
    this.f.cambioSucursal(suc).then(() => this.cdr.markForCheck());
  }

  // ── Modal observación ─────────────────────────────────────────────────────
  onObservacion(): void { this.f.mostrarModalObservacion(); this.cdr.markForCheck(); }
  onCerrarObs(): void   { this.f.cerrarModalObs(); this.cdr.markForCheck(); }

  // ── Modal cliente ─────────────────────────────────────────────────────────
  onNuevoCliente(): void { this.f.mostrarModalCliente(); this.cdr.markForCheck(); }

  // ── Modal cargar pedido ───────────────────────────────────────────────────
  onBuscarPedido(): void { this.f.buscarPedido().then(() => this.cdr.markForCheck()); }
  onSeleccionCliente(c: any): void { this.f.seleccionCliente(c); }
  onEditarPedido(p: any): void { this.f.editarPedido(p).then(() => this.cdr.markForCheck()); }
  onCancelarPedidos(): void { this.f.cancelarModalPedidos(); this.cdr.markForCheck(); }
  onPagePedidos(p: number): void { this.f.cargarPaginaPedidos(p).then(() => this.cdr.markForCheck()); }

  get pageNumsPedidos(): number[] {
    const total = Math.ceil(this.st.totalElementosPed() / (this.st.pageSizePed() || 10));
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}