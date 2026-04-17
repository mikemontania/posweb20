import { Injectable, signal, computed } from '@angular/core';
import { Pedido }        from '../../core/models/domain/pedido.model';
import { PedidoDetalle } from '../../core/models/domain/pedido-detalle.model';
import { Descuento }     from '../../core/models/domain/descuento.model';
import { Cliente }       from '../../core/models/domain/cliente.model';
import { ListaPrecio }   from '../../core/models/domain/lista-precio.model';
import { Canal }         from '../../core/models/domain/canal.model';

@Injectable()
export class PedidosStateService {

  // ── Pedido ────────────────────────────────────────────────────────────────
  pedido            = signal<Partial<Pedido> | null>(null);
  pedidoDetalles    = signal<PedidoDetalle[]>([]);
  pedidoDescuento   = signal<any[]>([]);   // PedidoDescuento[]

  // ── Descuentos ────────────────────────────────────────────────────────────
  descuentos                = signal<Descuento[]>([]);
  porcentajeDescuento       = signal(0);
  limitePorcentajeDescuento = signal(0);
  descuentoGrupoActual      = signal<Descuento | null>(null);
  descuentoClienteActual    = signal<Descuento | null>(null);
  descuentoImporteActual    = signal<Descuento | null>(null);
  descuentoSucursalActual   = signal<Descuento | null>(null);
  tieneDescuentoGrupo       = signal(false);
  tieneDescuentoSucursal    = signal(false);
  tieneDescuentoCliente     = signal(false);
  analizarDescuentoImporte  = signal(true);
  importeDescontable        = signal(0);

  // ── Cliente / entidad ─────────────────────────────────────────────────────
  cliente       = signal<Cliente | null>(null);
  razonSocial   = signal('');
  listaPrecio   = signal<ListaPrecio | null>(null);
  esContado     = signal(false);
  vendedor      = signal<any>(null);
  sucursal      = signal<any>(null);
  canal         = signal<Canal | null>(null);
  canales       = signal<any[]>([]);
  sucursales    = signal<any[]>([]);
  cobranza      = signal<any>(null);
  cobranzaAux   = signal<any>(null);
  cobranzasDetalle = signal<any[]>([]);

  // ── Medio de pago ─────────────────────────────────────────────────────────
  medioPago         = signal<any[]>([]);
  tipoMedioPago     = signal<any[]>([]);
  bancos            = signal<any[]>([]);
  selectModelMedio  = signal<any>(null);
  selectModelTipo   = signal<any>(null);
  selectModelBanco  = signal<any>(null);
  seleccionMedioPago = signal<number | null>(null);
  montoAbonado      = signal(0);
  totalAbonado      = signal(0);
  vuelto            = signal(0);
  nroRef            = signal('');
  nroCuenta         = signal('');
  fechaEmision      = signal('');
  fechaVencimiento  = signal('');
  codCobranzaDetalle = signal(0);

  // ── UI ────────────────────────────────────────────────────────────────────
  mostrarCliente       = signal(false);
  deshabilitarBuscador = signal(true);
  cargandoProds        = signal(false);
  guardando            = signal(false);
  cantidad             = signal(1);
  calculoTotalCantidad = signal(0);
  esContadoFlag        = signal(false);
  formaVentaLabel      = signal('');
  oculto               = signal('oculto');     // modal cobranza
  modalCliente         = signal('oculto');
  modalPedidos         = signal('oculto');
  mostrarModal         = signal(false);        // modal observacion
  modalCanal           = signal('oculto');

  // ── Modo edición ──────────────────────────────────────────────────────────
  modoEdicion    = signal(false);
  pedidoEditando = signal<number | null>(null);

  // ── Catálogo ──────────────────────────────────────────────────────────────
  productos             = signal<any[]>([]);
  categorias            = signal<any[]>([]);
  categoriaSeleccionada = signal<any>(null);
  totalElementos        = signal(0);
  cantidadElementos     = signal(0);
  clientes              = signal<any[]>([]);
  paginador             = signal<any>(null);
  pagina                = signal(0);  // 0-based para pos-catalogo

  // ── Lista pedidos (modal cargar pedido) ───────────────────────────────────
  listaPedidos     = signal<any[]>([]);
  totalElementosPed = signal(0);
  pageSizePed      = signal(0);
  paginaPedido     = signal(1);
  nroPedido        = signal(0);
  fechaInicio      = signal('');
  fechaFin         = signal('');
  clienteFiltro    = signal<any>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  carritoVacio  = computed(() => this.pedidoDetalles().length === 0);
  hayDescuentos = computed(() => this.descuentos().length > 0);

  // ── Helpers ───────────────────────────────────────────────────────────────
  patchPedido(p: Partial<Pedido>): void {
    this.pedido.update(v => v ? { ...v, ...p } : p);
  }
  pushDetalle(d: PedidoDetalle): void {
    this.pedidoDetalles.update(a => [...a, d]);
  }
  updateDetalle(i: number, d: PedidoDetalle): void {
    this.pedidoDetalles.update(a => a.map((x, j) => j === i ? d : x));
  }
  removeDetalle(i: number): void {
    this.pedidoDetalles.update(a => a.filter((_, j) => j !== i));
  }
  ordenarNroItem(): void {
    this.pedidoDetalles.update(a => a.map((d, i) => ({ ...d, nroItem: i + 1 })));
  }
  pushDescuento(d: Descuento): void {
    this.descuentos.update(a => [...a, d]);
  }
}