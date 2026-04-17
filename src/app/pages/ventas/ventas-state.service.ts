// VentasStateService — todo el estado reactivo del POS en signals
// El componente solo lee señales y llama métodos del Facade.
// No hace HTTP. No sabe de servicios de dominio.
import { Injectable, signal, computed } from '@angular/core';
import { Venta }           from '../../core/models/domain/venta.model';
import { VentaDetalle }    from '../../core/models/domain/venta-detalle.model';
import { VentaDescuento }  from '../../core/models/domain/venta-descuento.model';
import { Descuento }       from '../../core/models/domain/descuento.model';
import { Cliente }         from '../../core/models/domain/cliente.model';
import { Canal }           from '../../core/models/domain/canal.model';
import { FormaVenta }      from '../../core/models/domain/forma-venta.model';
import { ListaPrecio }     from '../../core/models/domain/lista-precio.model';
import { Vendedor }        from '../../core/models/domain/vendedor.model';
import { Deposito }        from '../../core/models/domain/deposito.model';
import { Comprobantes }    from '../../core/models/domain/comprobantes.model';
import { Terminales }      from '../../core/models/domain/terminales.model';
import { Pedido }          from '../../core/models/domain/pedido.model';
import { MedioPago }       from '../../core/models/domain/medio-pago.model';
import { TipoMedioPago }   from '../../core/models/domain/tipo-medio-pago.model';
import { Bancos }          from '../../core/models/domain/bancos.model';
import { Producto }        from '../../core/models/domain/producto.model';
import { CategoriaProducto } from '../../core/models/domain/categoria-producto.model';

@Injectable()
export class VentasStateService {

  // ── Listas catálogo/config ────────────────────────────────
  readonly terminales   = signal<Terminales[]>([]);
  readonly canales      = signal<Canal[]>([]);
  readonly formas       = signal<FormaVenta[]>([]);
  readonly medioPago    = signal<MedioPago[]>([]);
  readonly tipoMedioPago = signal<TipoMedioPago[]>([]);
  readonly bancos       = signal<Bancos[]>([]);
  readonly categorias   = signal<CategoriaProducto[]>([]);
  readonly clientes     = signal<Cliente[]>([]);

  // ── Productos paginados ───────────────────────────────────
  readonly productos        = signal<Producto[]>([]);
  readonly totalElementos   = signal(0);
  readonly cantidadElementos = signal(16);
  readonly pagina           = signal(0);
  readonly cargandoProds    = signal(false);

  // ── Objetos del contexto de venta ─────────────────────────
  readonly comprobante  = signal<Comprobantes | null>(null);
  readonly deposito     = signal<Deposito | null>(null);
  readonly vendedor     = signal<Vendedor | null>(null);
  readonly cliente      = signal<Cliente | null>(null);
  readonly listaPrecio  = signal<ListaPrecio | null>(null);
  readonly canal        = signal<Canal | null>(null);
  readonly formaVenta   = signal<FormaVenta | null>(null);
  readonly pedido       = signal<Pedido | null>(null);
  readonly terminal     = signal<Terminales | null>(null);

  // ── Venta cabecera ────────────────────────────────────────
  readonly venta        = signal<Partial<Venta> | null>(null);

  // ── Detalles carrito ──────────────────────────────────────
  readonly ventaDetalles   = signal<VentaDetalle[]>([]);
  readonly ventaDescuento  = signal<VentaDescuento[]>([]);
  readonly descuentos      = signal<Descuento[]>([]);

  // ── Flags de descuento ────────────────────────────────────
  readonly tieneDescuentoClienteFull = signal(false);
  readonly tieneDescuentoGrupo       = signal(false);
  readonly tieneDescuentoCliente     = signal(false);
  readonly tieneDescuentoSucursal    = signal(false);
  readonly analizarDescuentoImporte  = signal(true);
  readonly descuentoImporteActual    = signal<Descuento | null>(null);
  readonly descuentoClienteActual    = signal<Descuento | null>(null);
  readonly descuentoSucursalActual   = signal<Descuento | null>(null);
  readonly descuentoGrupoActual      = signal<Descuento | null>(null);
  readonly porcentajeDescuento       = signal(0);
  readonly limitePorcentajeDescuento = signal(0);
  readonly importeDescontable        = signal(0);
  readonly descuentoExtraInfluencer  = signal(0);
  readonly cuponPromo                = signal<{ cupon: string; descuento: number; alianza?: boolean; influencer?: boolean } | null>(null);

  // ── UI flags ──────────────────────────────────────────────
  readonly autorizado        = signal(false);
  readonly mostrarCliente    = signal(false);
  readonly buscadorHabilitado = signal(false);
  readonly tipoEcommerce     = signal(false);
  readonly esContado         = signal(false);
  readonly razonSocial       = signal('');
  readonly selFormaVentaCod  = signal<number | null>(null);
  readonly cobranzaPedidoAux = signal<any>(null);

  // ── UI modals ─────────────────────────────────────────────
  readonly modalTerminal   = signal(false);
  readonly modalCobranza   = signal(false);
  readonly modalPedidos    = signal(false);
  readonly modalCupon      = signal(false);
  readonly modalInfluencer = signal(false);

  // ── Estado guardado ───────────────────────────────────────
  readonly guardando = signal(false);

  // ── Pedidos modal ─────────────────────────────────────────
  readonly listaPedidos    = signal<any[]>([]);
  readonly totalPedidos    = signal(0);

  // ── Computed ──────────────────────────────────────────────
  readonly carritoVacio  = computed(() => this.ventaDetalles().length === 0);
  readonly totalAPagar   = computed(() => this.venta()?.importeTotal ?? 0);
  readonly hayDescuentos = computed(() => this.descuentos().length > 0);

  // ── Helpers de mutación (operaciones atómicas) ────────────
  pushDetalle(d: VentaDetalle): void {
    this.ventaDetalles.update(arr => [...arr, d]);
  }
  updateDetalle(idx: number, d: VentaDetalle): void {
    this.ventaDetalles.update(arr => arr.map((x, i) => i === idx ? d : x));
  }
  removeDetalle(idx: number): void {
    this.ventaDetalles.update(arr => arr.filter((_, i) => i !== idx));
  }
  spliceDetalle(predicate: (d: VentaDetalle) => boolean): void {
    this.ventaDetalles.update(arr => arr.filter(d => !predicate(d)));
  }
  ordenarNroItem(): void {
    this.ventaDetalles.update(arr => arr.map((d, i) => ({ ...d, nroItem: i + 1 })));
  }

  pushDescuento(d: Descuento): void {
    this.descuentos.update(arr => [...arr, d]);
  }
  removeDescuento(predicate: (d: Descuento, i?: number) => boolean): void {
    this.descuentos.update(arr => arr.filter((d, i) => !predicate(d, i)));
  }

  resetDescuentos(): void {
    this.descuentos.set([]);
    this.porcentajeDescuento.set(0);
    this.limitePorcentajeDescuento.set(0);
    this.descuentoGrupoActual.set(null);
    this.descuentoClienteActual.set(null);
    this.descuentoImporteActual.set(null);
    this.descuentoSucursalActual.set(null);
    this.tieneDescuentoGrupo.set(false);
    this.tieneDescuentoSucursal.set(false);
    this.tieneDescuentoCliente.set(false);
    this.tieneDescuentoClienteFull.set(false);
  }

  patchVenta(partial: Partial<Venta>): void {
    this.venta.update(v => v ? { ...v, ...partial } : partial);
  }

  resetCarrito(): void {
    this.ventaDetalles.set([]);
    this.ventaDescuento.set([]);
    this.resetDescuentos();
    this.descuentoExtraInfluencer.set(0);
    this.cuponPromo.set(null);
    this.importeDescontable.set(0);
    this.cobranzaPedidoAux.set(null);
  }
}
