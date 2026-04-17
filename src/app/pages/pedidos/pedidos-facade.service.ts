/**
 * PedidosFacadeService
 * Traducción DIRECTA y FIEL del ng12 pedidos.component.ts a ng20.
 * No se omite ni inventa lógica — cada método refleja su equivalente ng12.
 */
import { Injectable, inject } from '@angular/core';
import { Router }             from '@angular/router';
import { firstValueFrom }     from 'rxjs';

import { AuthService }         from '../../core/services/auth.service';
import { ToastService }        from '../../shared/components/toast/toast.service';
import { ClienteService }      from '../../core/services/domain/cliente.service';
import { ProductoService }     from '../../core/services/domain/producto.service';
import { PrecioService }       from '../../core/services/domain/precio.service';
import { DescuentoService }    from '../../core/services/domain/descuento.service';
import { VendedorService }     from '../../core/services/domain/vendedor.service';
import { CanalService }        from '../../core/services/domain/canal.service';
import { CategoriaService }    from '../../core/services/domain/categoria.service';
import { SucursalService }     from '../../core/services/domain/sucursal.service';
import { PedidosService }      from '../../core/services/domain/pedidos.service';
import { BancosService }       from '../../core/services/domain/bancos.service';
import { MedioPagoService }    from '../../core/services/domain/medio-pago.service';
import { TipoMedioPagoService } from '../../core/services/domain/tipo-medio-pago.service';
import { ListaPrecioService }  from '../../core/services/domain/lista-precio.service';

import { PedidosStateService } from './pedidos-state.service';
import { PedidoDetalle }       from '../../core/models/domain/pedido-detalle.model';
import { Cliente }             from '../../core/models/domain/cliente.model';
import { Descuento }           from '../../core/models/domain/descuento.model';

@Injectable()
export class PedidosFacadeService {

  private readonly auth      = inject(AuthService);
  private readonly router    = inject(Router);
  readonly toast             = inject(ToastService);
  private readonly cliSvc    = inject(ClienteService);
  private readonly prodSvc   = inject(ProductoService);
  private readonly precSvc   = inject(PrecioService);
  private readonly descSvc   = inject(DescuentoService);
  private readonly vendSvc   = inject(VendedorService);
  private readonly canalSvc  = inject(CanalService);
  private readonly catSvc    = inject(CategoriaService);
  private readonly sucSvc    = inject(SucursalService);
  private readonly pedSvc    = inject(PedidosService);
  private readonly bancosSvc = inject(BancosService);
  private readonly mpSvc     = inject(MedioPagoService);
  private readonly tmpSvc    = inject(TipoMedioPagoService);
  private readonly lpSvc     = inject(ListaPrecioService);

  readonly st = inject(PedidosStateService);
  private get user() { return this.auth.session!; }

  // ── invalido — ng12: toastr.error ────────────────────────────────────────
  invalido(msg: string): void { this.toast.error(msg); }

  // ── ngOnInit equivalente ──────────────────────────────────────────────────
  async init(): Promise<void> {
    const todos = {
      codCategoriaProducto: 0, codCategoriaProductoErp: '99',
      descripcion: 'Todos', codEmpresa: this.user.codEmpresa
    };
    this.st.categoriaSeleccionada.set(todos);
    this.st.modoEdicion.set(false);
    this.st.cantidad.set(1);
    this.st.deshabilitarBuscador.set(true);
    await this.cargarSucursales();
    await this.cargar();
  }

  // ── cargarSucursales ──────────────────────────────────────────────────────
  async cargarSucursales(): Promise<void> {
    const r: any = await firstValueFrom(
      this.sucSvc.getAll({ codempresa: this.user.codEmpresa } as any)
    ).catch(() => null);
    this.st.sucursales.set(Array.isArray(r) ? r : (r?.content ?? []));
  }

  // ── cargar — fiel al ng12 ─────────────────────────────────────────────────
  async cargar(): Promise<void> {
    this.st.porcentajeDescuento.set(0);
    this.st.limitePorcentajeDescuento.set(this.user.maxDescuentoPorc ?? 100);

    const vendedor = await firstValueFrom(
      this.vendSvc.getByCodUser(this.user.codUsuario)
    ).catch(() => null);
    if (!vendedor) {
      this.router.navigate(['/dashboard']);
      this.invalido('Usuario no es vendedor'); return;
    }
    this.st.vendedor.set(vendedor);

    const catsRaw: any = await firstValueFrom(
      this.catSvc.getAll({ codempresa: this.user.codEmpresa })
    ).catch(() => null);
    if (!catsRaw) {
      this.router.navigate(['/dashboard']);
      this.invalido('No existen categorias'); return;
    }
    const cats = Array.isArray(catsRaw) ? catsRaw : (catsRaw?.content ?? []);
    const todos = { codCategoriaProducto: 0, codCategoriaProductoErp: '99', descripcion: 'Todos', codEmpresa: this.user.codEmpresa };
    this.st.categorias.set([todos, ...cats]);

    const sucursal: any = await firstValueFrom(
      (this.sucSvc.getById(this.user.codSucursal) as any)
    ).catch(() => null);
    if (!sucursal) {
      this.router.navigate(['/dashboard']);
      this.invalido('Sucursal no puede ser null'); return;
    }
    this.st.sucursal.set(sucursal);

    const clienteDefault: any = await firstValueFrom(
      this.cliSvc.getClienteDefault()
    ).catch(() => null);
    if (!clienteDefault) {
      this.router.navigate(['/dashboard']);
      this.invalido('No existe cliente Predeterminado'); return;
    }
    this.st.cliente.set(clienteDefault);
    this.st.razonSocial.set(clienteDefault.concatDocNombre ?? '');
    this.st.listaPrecio.set(clienteDefault.listaPrecio);
    if (!clienteDefault.listaPrecio) {
      this.router.navigate(['/dashboard']);
      this.invalido('El Cliente no posee lista de precio'); return;
    }

    this.pedidoInit();
    this.iniciarCobranza();

    const canalesRaw: any = await firstValueFrom(
      this.canalSvc.getAll({ codempresa: this.user.codEmpresa } as any)
    ).catch(() => null);
    if (!canalesRaw) {
      this.router.navigate(['/dashboard']);
      this.invalido('canal no puede ser null'); return;
    }
    const canales = Array.isArray(canalesRaw) ? canalesRaw : (canalesRaw?.content ?? []);
    this.st.canales.set(canales);

    const cp: any = await firstValueFrom(
      this.canalSvc.getCanalPrincipal()
    ).catch(() => null);
    this.st.canal.set(cp ?? canales[0] ?? null);

    const descImp: any = await firstValueFrom(
      this.descSvc.getDescuentoByTipo('IMPORTE', clienteDefault.listaPrecio.codListaPrecio)
    ).catch(() => null);
    this.st.analizarDescuentoImporte.set(!!descImp);

    await this.buscarDescuentos();
    this.st.mostrarCliente.set(true);
    this.st.deshabilitarBuscador.set(false);
    this.traerProductos(0, '', this.st.categoriaSeleccionada()?.codCategoriaProducto ?? 0);
  }

  // ── pedidoInit — fiel al ng12 ─────────────────────────────────────────────
  pedidoInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    const u   = this.user;
    const suc = this.st.sucursal();
    this.st.pedido.set({
      codPedido:           null as any,
      anulado:             false,
      codEmpresaErp:       u.codEmpresaErp,
      codSucursalErp:      suc?.codSucursalErp ?? u.codSucursalErp,
      codEmpresa:          u.codEmpresa,
      codSucursal:         suc?.codSucursal ?? u.codSucursal,
      estado:              'PENDIENTE',
      modoEntrega:         'CONTRA_ENTREGA',
      fechaAnulacion:      null as any,
      fechaCreacion:       null as any,
      fechaPedido:         today,
      fechaPedidoReal:     today,
      fechaModificacion:   null as any,
      porcDescuento:       0,
      importeDescuento:    0,
      importeIva5:         0,
      importeIva10:        0,
      importeIvaExenta:    0,
      importeNeto:         0,
      importeTotal:        0,
      descuentoProducto:   0,
      subTotal:            0,
      totalKg:             0,
      nroPedido:           null as any,
      codUsuarioAnulacion: null as any,
      codUsuarioCreacion:  u.codUsuario,
      cliente:             this.st.cliente() ?? undefined,
      canal:               this.st.canal()   ?? undefined,
      detalle:             this.st.pedidoDetalles() as any,
      cobranza:            null as any,
      vendedor:            this.st.vendedor() ?? undefined,
      codVendedorErp:      this.st.vendedor()?.codVendedorErp ?? '',
      listaPrecio:         this.st.listaPrecio() ?? undefined,
      tipoPedido:          'POS',
      cupon:               null as any,
      observacion:         null as any,
    });
  }

  // ── iniciarCobranza — fiel al ng12 ────────────────────────────────────────
  iniciarCobranza(): void {
    this.st.cobranza.set({
      anulado:        false,
      codCobranza:    null,
      importeCobrado: 0,
      importeAbonado: 0,
      fechaCobranza:  new Date().toISOString().slice(0, 10),
      saldo:          0,
      detalle:        null,
      tipo:           'PEDIDO',
    });
  }

  // ── traerProductos — fiel al ng12 ─────────────────────────────────────────
  traerProductos(page: number, termino: string, codCategoria: number): void {
    this.st.cargandoProds.set(true);
    const params: Record<string, any> = {
      codempresa: this.user.codEmpresa, page, size: 14, activo: true,
    };
    if (termino)      params['keyword']              = termino.toUpperCase();
    if (codCategoria) params['codCategoriaProducto'] = codCategoria;

    this.prodSvc.getAll(params).subscribe({
      next: (r: any) => {
        const items = Array.isArray(r) ? r : (r?.content ?? []);
        this.st.productos.set(items);
        this.st.paginador.set(r);
        this.st.totalElementos.set(r?.totalElements ?? items.length);
        this.st.cantidadElementos.set(r?.size ?? items.length);
        this.st.cargandoProds.set(false);
        // ng12: auto-seleccionar si 1 resultado y termino > 8 chars
        if (items.length === 1 && termino.length > 8) {
          this.seleccionarProducto(items[0]);
          this.traerProductos(0, '', this.st.categoriaSeleccionada()?.codCategoriaProducto ?? 0);
        }
      },
      error: () => this.st.cargandoProds.set(false),
    });
  }

  // ── buscarProducto — fiel al ng12 ─────────────────────────────────────────
  buscarProducto(termino: string): void {
    if (!termino || termino.length <= 2) {
      this.traerProductos(0, '', this.st.categoriaSeleccionada()?.codCategoriaProducto ?? 0);
      return;
    }
    this.traerProductos(0, termino.toUpperCase(), this.st.categoriaSeleccionada()?.codCategoriaProducto ?? 0);
  }

  // ── cambiarValor (cantidad) ───────────────────────────────────────────────
  cambiarValor(delta: number): void {
    const nueva = this.st.cantidad() + delta;
    if (nueva <= 0) { this.st.cantidad.set(1); return; }
    this.st.cantidad.set(nueva);
  }

  // ── filtrarCategoria ──────────────────────────────────────────────────────
  filtrarCategoria(cat: any): void {
    this.st.categoriaSeleccionada.set(cat);
    this.traerProductos(0, '', cat ? cat.codCategoriaProducto : 0);
  }

  // ── seleccionarProducto — FIEL AL NG12 ────────────────────────────────────
  async seleccionarProducto(producto: any, cantidadOverride?: number): Promise<boolean> {
    const cantidad = cantidadOverride ?? this.st.cantidad();
    if (cantidad <= 0) { this.invalido('Cantidad debe ser mayor a 0'); return false; }

    const cli  = this.st.cliente()!;
    const lp   = this.st.listaPrecio()!;
    const vend = this.st.vendedor()!;

    let detalles = this.st.pedidoDetalles();
    let indice = detalles.findIndex(d => d.producto.codProducto === producto.codProducto);

    if (indice === -1) {
      // ng12: push vacío primero
      const nuevo: PedidoDetalle = {
        codPedidoDetalle: null as any, nroItem: detalles.length + 1,
        cantidad: 0, importeDescuento: 0, importeIva5: 0, importeIva10: 0,
        importeIvaExenta: 0, importeNeto: 0, importePrecio: 0,
        importeTotal: 0, subTotal: 0, totalKg: 0,
        porcDescuento: 0, porcIva: 0, tipoDescuento: '',
        producto, unidadMedida: null as any,
        pedido: null as any, vendedor: null as any, codVendedorErp: null as any,
      };
      const precio: any = await firstValueFrom(
        this.precSvc.getPrecio(cantidad, producto.codProducto, lp.codListaPrecio, cli.codCliente)
      ).catch(() => null);
      if (!precio) { this.invalido('El producto no tiene precio'); return false; }

      this.st.pushDetalle(nuevo);
      detalles = this.st.pedidoDetalles();
      indice = detalles.findIndex(d => d.producto.codProducto === producto.codProducto);
      this.st.updateDetalle(indice, {
        ...detalles[indice],
        cantidad: detalles[indice].cantidad + cantidad,
        vendedor: vend,
        codVendedorErp: vend.codVendedorErp,
      });
    } else {
      const nuevaCant = detalles[indice].cantidad + cantidad;
      this.st.updateDetalle(indice, { ...detalles[indice], cantidad: nuevaCant });
    }

    detalles = this.st.pedidoDetalles();
    const det = detalles[indice];

    const precio: any = await firstValueFrom(
      this.precSvc.getPrecio(det.cantidad, producto.codProducto, lp.codListaPrecio, cli.codCliente)
    ).catch(() => null);
    if (!precio) { this.invalido('El producto no tiene precio'); return false; }

    // importePrecio con excentoIva
    let importePrecio = precio.precio;
    if (cli.excentoIva) {
      if (producto.iva === 5)  importePrecio = precio.precio - Math.round(precio.precio / 21);
      if (producto.iva === 10) importePrecio = precio.precio - Math.round(precio.precio / 11);
    }

    const subTotal = det.cantidad * importePrecio;
    let updated: PedidoDetalle = {
      ...det, importePrecio, porcIva: producto.iva,
      unidadMedida: precio.unidadMedida,
      totalKg:          det.cantidad * (producto.peso ?? 0),
      subTotal, importeDescuento: 0, porcDescuento: 0,
    };

    // descuentos solo si sinDescuento == false
    if (!producto.sinDescuento) {
      updated = await this._aplicarDescuentoDetalle(updated, lp.codListaPrecio);
    }

    updated.importeTotal = updated.subTotal - updated.importeDescuento;
    if (!cli.excentoIva) {
      updated = this._calcularIva(updated);
    } else {
      // ng12: excentoIva → todo exenta
      updated = { ...updated, porcIva: 0, importeIva5: 0, importeIva10: 0,
                  importeIvaExenta: updated.importeTotal, importeNeto: updated.importeTotal };
    }

    // ng12: mueve el detalle al final (splice + push)
    this.st.removeDetalle(indice);
    this.st.pushDetalle(updated);

    this.toast.success(producto.nombreProducto, { title: '¡Producto agregado!' });
    this.st.cantidad.set(1);
    await this.reHacer();
    return true;
  }

  // ── restarProducto — fiel al ng12 ────────────────────────────────────────
  async restarProducto(item: PedidoDetalle): Promise<void> {
    if (item.cantidad === 1) return; // ng12: si es 1, no hace nada
    const idx = this.st.pedidoDetalles().findIndex(d => d === item);
    if (idx < 0) return;
    this.st.updateDetalle(idx, { ...item, cantidad: item.cantidad - 1 });
    await this._reHacerDetallesPorPrecio();
    await this.reHacer();
  }

  // ── quitarProductoCompleto — fiel al ng12 ────────────────────────────────
  async quitarProductoCompleto(item: PedidoDetalle): Promise<void> {
    // ng12: busca si hay desc PRODUCTO para ese producto, lo quita y resta porcentaje
    const dIdx = this.st.descuentos().findIndex(
      d => d.tipoDescuento === 'PRODUCTO' && (d as any).producto?.codProducto === item.producto.codProducto
    );
    if (dIdx > -1) {
      const desc = this.st.descuentos()[dIdx];
      this.st.porcentajeDescuento.update(p => p - desc.descuento);
      this.st.descuentos.update(a => a.filter((_, i) => i !== dIdx));
    }
    const idx = this.st.pedidoDetalles().findIndex(d => d === item);
    if (idx >= 0) this.st.removeDetalle(idx);
    this.st.importeDescontable.set(0);
    await this._reHacerDetallesPorPrecio();
    await this.reHacer();
    this.st.ordenarNroItem();
  }

  async quitarDescuento(descuento: Descuento): Promise<void> {
    // ng12: si es SUCURSAL → marcar flag en false
    if (descuento.tipoDescuento === 'SUCURSAL') {
      this.st.tieneDescuentoSucursal.set(false);
    }
    // ng12: restar el porcentaje antes de quitar del array
    this.st.porcentajeDescuento.update(p => p - descuento.descuento);
    this.st.descuentos.update(a => a.filter(d => d !== descuento));
    await this.reHacer();
  }

  // ── reHacer — fiel al ng12 ────────────────────────────────────────────────
  async reHacer(): Promise<void> {
    const cli = this.st.cliente()!;
    if (cli?.listaPrecio?.codListaPrecio !== this.st.listaPrecio()?.codListaPrecio) {
      await this._reHacerDetallesPorPrecio();
    }
    this._reHacerTotal();
    await this._calcularDescuentoImporte();
    await this._reHacerDetalles();
    this._reHacerTotal();
  }

  // ── buscarDescuentos — FIEL AL NG12 (incluye navegar al dashboard si no hay grupo) ───
  async buscarDescuentos(): Promise<void> {
    const cli = this.st.cliente()!;
    const lp  = this.st.listaPrecio()!;

    if (!cli.grupoDescuento) {
      this.router.navigate(['/dashboard']);
      this.invalido('El Cliente no posee grupo descuento');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (cli.grupoDescuento.descuento > 0 && cli.carnetVencimiento >= today) {
      const dSuc: any = await firstValueFrom(
        this.descSvc.getDescuento('SUCURSAL', 1, 1, lp.codListaPrecio)
      ).catch(() => null);
      const porcSuc = dSuc ? 10 : 0; // ng12 hardcodea 10 si hay sucursal
      const dGrupo: Descuento = {
        codDescuento: 0, descripcion: cli.grupoDescuento.descripcion,
        codDescuentoErp: '', codEmpresa: this.user.codSucursal,
        codSucursal: this.user.codSucursal, listaPrecio: lp,
        tipoDescuento: 'Grupo cliente', unidadDescuento: 'PORCENTAJE',
        fechaDesde: new Date(), fechaHasta: new Date(),
        producto: null as any, cliente: null as any, medioPago: null as any,
        descuento: cli.grupoDescuento.descuento + porcSuc,
        cantDesde: 0, cantHasta: 99999999, activo: true,
      };
      this.st.descuentoGrupoActual.set(dGrupo);
      this.st.porcentajeDescuento.update(p => p + dGrupo.descuento);
      this.st.tieneDescuentoGrupo.set(true);
      this.st.tieneDescuentoSucursal.set(false);
      this.st.tieneDescuentoCliente.set(false);
      this.st.pushDescuento(dGrupo);
      return;
    }

    const dSuc: any = await firstValueFrom(
      this.descSvc.getDescuento('SUCURSAL', 1, 1, lp.codListaPrecio)
    ).catch(() => null);
    if (dSuc) {
      this.st.descuentoSucursalActual.set(dSuc);
      this.st.porcentajeDescuento.update(p => p + dSuc.descuento);
      this.st.tieneDescuentoSucursal.set(true);
      this.st.pushDescuento(dSuc);
      return;
    }

    this.st.tieneDescuentoSucursal.set(false);
    const dCli: any = await firstValueFrom(
      this.descSvc.getDescuento('CLIENTE', cli.codCliente, 1, lp.codListaPrecio)
    ).catch(() => null);
    if (dCli) {
      this.st.descuentoClienteActual.set(dCli);
      this.st.porcentajeDescuento.update(p => p + dCli.descuento);
      this.st.tieneDescuentoCliente.set(true);
      this.st.pushDescuento(dCli);
      return;
    }
    this.st.tieneDescuentoCliente.set(false);
  }

  // ── seleccionarCliente — fiel al ng12 ─────────────────────────────────────
  async seleccionarCliente(item: Cliente): Promise<void> {
    this.st.tieneDescuentoGrupo.set(false);
    this.st.tieneDescuentoSucursal.set(false);
    this.st.tieneDescuentoCliente.set(false);
    this.st.limitePorcentajeDescuento.set(this.user.maxDescuentoPorc ?? 100);
    this.st.porcentajeDescuento.set(0);
    this.pedidoInit();
    this.iniciarCobranza();
    this.st.cliente.set(item);
    this.st.razonSocial.set(item.concatDocNombre ?? '');
    this.st.listaPrecio.set(item.listaPrecio);
    if (!item.listaPrecio) {
      this.router.navigate(['/dashboard']);
      this.invalido('El Cliente no posee lista de precio'); return;
    }
    this.st.esContado.set(item.formaVentaPref?.esContado === true);
    this.st.formaVentaLabel.set(item.formaVentaPref?.descripcion ?? '');

    const catsRaw: any = await firstValueFrom(
      this.catSvc.getAll({ codempresa: this.user.codEmpresa })
    ).catch(() => null);
    if (!catsRaw) {
      this.router.navigate(['/dashboard']);
      this.invalido('No existen categorias'); return;
    }
    const cats = Array.isArray(catsRaw) ? catsRaw : (catsRaw?.content ?? []);
    const todos = { codCategoriaProducto: 0, codCategoriaProductoErp: '99', descripcion: 'Todos', codEmpresa: this.user.codEmpresa };
    this.st.categorias.set([todos, ...cats]);

    const descImp: any = await firstValueFrom(
      this.descSvc.getDescuentoByTipo('IMPORTE', item.listaPrecio.codListaPrecio)
    ).catch(() => null);
    this.st.analizarDescuentoImporte.set(!!descImp);
    await this.buscarDescuentos();

    this.st.mostrarCliente.set(true);
    this.st.deshabilitarBuscador.set(false);

    // ng12: restaurar detalles del localStorage si existen
    const saved = localStorage.getItem('detalles');
    if (saved) {
      try {
        const parsed: PedidoDetalle[] = JSON.parse(atob(saved));
        if (Array.isArray(parsed)) this.st.pedidoDetalles.set(parsed);
        await this._reHacerDetallesPorPrecio();
        await this.reHacer();
        localStorage.removeItem('detalles');
      } catch { localStorage.removeItem('detalles'); }
    } else if (this.st.pedidoDetalles().length > 0) {
      await this._reHacerDetallesPorPrecio();
      await this.reHacer();
    }
    this.traerProductos(0, '', this.st.categoriaSeleccionada()?.codCategoriaProducto ?? 0);
  }

  // ── cambiarCliente — fiel al ng12 ─────────────────────────────────────────
  cambiarCliente(): void {
    this.st.deshabilitarBuscador.set(true);
    this.st.codCobranzaDetalle.set(0);
    this.st.oculto.set('oculto');
    this.st.cargandoProds.set(false);
    this.st.porcentajeDescuento.set(0);
    this.st.limitePorcentajeDescuento.set(0);
    this.st.totalElementos.set(0);
    this.st.cantidadElementos.set(0);
    this.st.totalAbonado.set(0);
    this.st.cantidad.set(1);
    this.st.montoAbonado.set(0);
    this.st.vuelto.set(0);
    this.st.pedidoDescuento.set([]);
    this.st.pedidoDetalles.set([]);
    this.st.cobranzasDetalle.set([]);
    this.st.descuentos.set([]);
    this.st.descuentoImporteActual.set(null);
    this.st.clientes.set([]);
    this.st.productos.set([]);
    this.st.nroRef.set('');
    this.st.mostrarCliente.set(false);
    this.pedidoInit();
    this.iniciarCobranza();
    this.cargarClientesIniciales();
  }

  // ── guardarDetalles — fiel al ng12 (btoa localStorage) ───────────────────
  guardarDetalles(): void {
    localStorage.setItem('detalles', btoa(JSON.stringify(this.st.pedidoDetalles())));
    this.cambiarCliente();
  }

  // ── verificarPedido — fiel al ng12 ───────────────────────────────────────
  verificarPedido(): void {
    const total = this.st.pedido()?.importeTotal ?? 0;
    if (total > 0) {
      if (!confirm('¿Seguro que desea cambiar de cliente?')) return;
      this.guardarDetalles();
    } else {
      this.cambiarCliente();
    }
  }

  // ── verificarTipoPedido — fiel al ng12 ────────────────────────────────────
  async verificarTipoPedido(): Promise<void> {
    if (!this.st.pedido()?.cobranza) {
      this.guardarPedido();
    } else {
      if (!this.st.pedido() || !this.st.cliente()) {
        this.invalido('Pedido o cliente no puede ser nulo'); return;
      }
      if ((this.st.pedido()?.importeTotal ?? 0) <= 0) {
        this.invalido('Pedido debe ser mayor a 0'); return;
      }
      await this.mostrarModalCobranza();
    }
  }

  // ── guardarPedido — fiel al ng12 ──────────────────────────────────────────
  guardarPedido(): void {
    const ok = confirm('¿Seguro que desea guardar el pedido?');
    if (!ok) return;

    // ng12: si tiene desc grupo → sacarlo del array
    if (this.st.tieneDescuentoGrupo()) {
      const gActual = this.st.descuentoGrupoActual();
      this.st.descuentos.update(a => a.filter(d => d !== gActual));
    }

    const pedidoDescuento: any[] = [];
    for (const d of this.st.descuentos()) {
      if (d) pedidoDescuento.push({ codDescuento: d.codDescuento, codPedido: null, codPedidoDescuento: null });
    }

    this.st.patchPedido({
      canal:          this.st.canal() ?? undefined,
      cliente:        this.st.cliente() ?? undefined,
      porcDescuento:  this.st.porcentajeDescuento(),
      vendedor:       this.st.vendedor() ?? undefined,
      codVendedorErp: this.st.vendedor()?.codVendedorErp ?? '',
      detalle:        [] as any,
    });
    this.st.patchPedido({ detalle: this.st.pedidoDetalles() as any });
    if (this.st.cliente()?.listaPrecio)
      this.st.patchPedido({ listaPrecio: this.st.cliente()!.listaPrecio });

    const objeto = { pedido: this.st.pedido(), descuentos: pedidoDescuento };
    this.st.guardando.set(true);

    const obs$ = this.st.modoEdicion()
      ? this.pedSvc.update(objeto)
      : this.pedSvc.create(objeto);

    obs$.subscribe({
      next: () => {
        this.st.guardando.set(false);
        this.toast.success(
          this.st.modoEdicion()
            ? 'Pedido Actualizado. Disponible desde el menú ventas.'
            : 'Pedido disponible. Disponible desde el menú ventas.'
        );
        this.limpiar();
        this.init();
      },
      error: (err: any) => {
        this.st.guardando.set(false);
        this.invalido(err.status === 504 ? 'Timeout. Verificá si el pedido fue guardado.' : 'Error al guardar el pedido.');
      }
    });
  }

  // ── limpiar — fiel al ng12 ────────────────────────────────────────────────
  limpiar(): void {
    this.st.nroPedido.set(0);
    this.st.modoEdicion.set(false);
    this.st.pedidoEditando.set(null);
    this.st.descuentoClienteActual.set(null);
    this.st.descuentoImporteActual.set(null);
    this.st.descuentoSucursalActual.set(null);
    this.st.cobranza.set(null);
    this.st.cobranzaAux.set(null);
    this.st.importeDescontable.set(0);
    this.st.codCobranzaDetalle.set(0);
    this.st.oculto.set('oculto');
    this.st.cargandoProds.set(false);
    this.st.porcentajeDescuento.set(0);
    this.st.limitePorcentajeDescuento.set(0);
    this.st.totalElementos.set(0);
    this.st.totalAbonado.set(0);
    this.st.cantidad.set(1);
    this.st.montoAbonado.set(0);
    this.st.vuelto.set(0);
    this.st.medioPago.set([]);
    this.st.pedidoDescuento.set([]);
    this.st.pedidoDetalles.set([]);
    this.st.cobranzasDetalle.set([]);
    this.st.descuentos.set([]);
    this.st.clientes.set([]);
    this.st.productos.set([]);
    this.pedidoInit();
    this.iniciarCobranza();
    this.st.nroRef.set('');
    this.st.categoriaSeleccionada.set({ codCategoriaProducto: 0, codCategoriaProductoErp: '99', descripcion: 'Todos', codEmpresa: this.user.codEmpresa });
  }

  // ── mostrarModalCobranza — fiel al ng12 ───────────────────────────────────
  async mostrarModalCobranza(): Promise<void> {
    if (!this.st.pedido() || !this.st.cliente()) {
      this.invalido('Pedido o cliente no puede ser nulo'); return;
    }
    if ((this.st.pedido()?.importeTotal ?? 0) <= 0) {
      this.invalido('Pedido debe ser mayor a 0'); return;
    }
    if (this.st.pedido()?.tipoPedido === 'POS') await this.reHacer();

    this.st.medioPago.set([]);
    this.st.selectModelMedio.set(null);
    const [bancos, medios, tipos] = await Promise.all([
      firstValueFrom(this.bancosSvc.getAll({ codempresa: this.user.codEmpresa } as any)).catch(() => []),
      firstValueFrom(this.mpSvc.getAll({ codempresa: this.user.codEmpresa } as any)).catch(() => []),
      firstValueFrom(this.tmpSvc.getAll({ codempresa: this.user.codEmpresa } as any)).catch(() => []),
    ]);
    this.st.bancos.set(Array.isArray(bancos) ? bancos : []);
    this.st.medioPago.set(Array.isArray(medios) ? medios : []);
    this.st.tipoMedioPago.set(Array.isArray(tipos) ? tipos : []);

    const cli = this.st.cliente()!;
    this.st.esContado.set(cli.formaVentaPref?.esContado === true);
    this.st.formaVentaLabel.set(cli.formaVentaPref?.descripcion ?? '');

    this.st.oculto.set('');
    this.st.totalAbonado.set(0);
    this.st.selectModelMedio.set(null);
    this.st.seleccionMedioPago.set(null);
    this.iniciarCobranza();
    this.cambioMedioPago(cli.medioPagoPref?.codMedioPago ?? 0);

    const pedido = this.st.pedido()!;
    this.st.cobranza.update(c => ({ ...c, importeCobrado: Math.round(pedido.importeTotal ?? 0) }));

    const cobAux = this.st.cobranzaAux();
    if (cobAux) {
      this.st.cobranza.set({ ...cobAux, importeCobrado: pedido.importeTotal });
      this.st.cobranzasDetalle.set(cobAux.detalle ?? []);
      this.st.totalAbonado.set(cobAux.importeAbonado ?? 0);
      this.st.vuelto.set((cobAux.importeAbonado ?? 0) - (pedido.importeTotal ?? 0));
    }
    this.st.ordenarNroItem();
  }

  cancelarModal(): void {
    this.st.oculto.set('oculto');
    this.st.medioPago.set([]);
    this.st.tipoMedioPago.set([]);
    this.st.bancos.set([]);
  }

  cerrarModal(): void {
    this.st.oculto.set('oculto');
    this.limpiar();
  }

  // ── cambioMedioPago — fiel al ng12 ────────────────────────────────────────
  cambioMedioPago(cod: number): void {
    this.st.montoAbonado.set(0);
    this.st.selectModelBanco.set(null);
    this.st.fechaEmision.set('');
    this.st.fechaVencimiento.set('');
    this.st.nroCuenta.set('');
    this.st.nroRef.set('');
    this.st.seleccionMedioPago.set(cod);
    const medio = this.st.medioPago().find((m: any) => m.codMedioPago == cod) ?? null;
    this.st.selectModelMedio.set(medio);
  }

  // ── agregarCobranza — fiel al ng12 ────────────────────────────────────────
  agregarCobranza(): void {
    const monto = this.st.montoAbonado();
    if (monto < 100) { this.invalido('Monto de cobranza no puede ser menor a 100 Gs.'); return; }
    const medio = this.st.selectModelMedio();
    if (!medio) { this.invalido('Medio pago no puede ser nulo'); return; }
    if (medio.tieneBanco && !this.st.selectModelBanco()) { this.invalido('Banco no puede ser nulo'); return; }
    if (medio.tieneTipo  && !this.st.selectModelTipo())  { this.invalido('Tipo no puede ser nulo'); return; }
    if (medio.tieneRef   && !this.st.nroRef())           { this.invalido('Numero de referencia no puede ser nulo'); return; }
    if (medio.esCheque) {
      if (!this.st.fechaEmision())    { this.invalido('Fecha de emision no puede ser nulo'); return; }
      if (!this.st.fechaVencimiento()) { this.invalido('Fecha de vencimiento no puede ser nulo'); return; }
      if (!this.st.nroRef())          { this.invalido('Numero de referencia no puede ser nulo'); return; }
      if (!this.st.nroCuenta())       { this.invalido('Numero cuenta no puede ser nulo'); return; }
    }

    this.st.vuelto.set(this.st.totalAbonado() - (this.st.pedido()?.importeTotal ?? 0));
    let codDet = this.st.codCobranzaDetalle();
    if (codDet === 0) codDet = 1;

    const detalle = {
      codCobranzaDetalle: codDet,
      importeAbonado:   monto,
      importeCobrado:   0,
      saldo:            0,
      medioPago:        medio,
      tipoMedioPago:    this.st.selectModelTipo(),
      banco:            this.st.selectModelBanco(),
      nroRef:           this.st.nroRef(),
      nroCuenta:        this.st.nroCuenta(),
      fechaEmision:     this.st.fechaEmision(),
      fechaVencimiento: this.st.fechaVencimiento(),
    };
    this.st.cobranzasDetalle.update(a => [...a, detalle]);
    this.st.totalAbonado.update(t => t + monto);
    this.st.vuelto.set(this.st.totalAbonado() - (this.st.pedido()?.importeTotal ?? 0));
    this.st.codCobranzaDetalle.update(c => c + 1);
    this.st.montoAbonado.set(0);
    this.st.nroRef.set('');
  }

  quitarCobranza(item: any): void {
    this.st.totalAbonado.update(t => t - item.importeAbonado);
    this.st.cobranzasDetalle.update(a => a.filter(d => d !== item));
    this.st.vuelto.set(this.st.totalAbonado() - (this.st.pedido()?.importeTotal ?? 0));
  }

  usar(monto: number): void { this.st.montoAbonado.set(monto); }

  // ── guardarCobranza — fiel al ng12 ────────────────────────────────────────
  guardarCobranza(): void {
    let montoCobrandoCab = this.st.pedido()?.importeTotal ?? 0;
    const detalles = [...this.st.cobranzasDetalle()];
    detalles.forEach(d => {
      if (montoCobrandoCab > d.importeAbonado) {
        d.importeCobrado = d.importeAbonado;
        montoCobrandoCab = Math.round(montoCobrandoCab - d.importeAbonado);
        d.saldo = Math.round(d.importeAbonado - d.importeCobrado);
      } else if (montoCobrandoCab === d.importeAbonado) {
        d.importeCobrado = d.importeAbonado;
        montoCobrandoCab = Math.round(montoCobrandoCab - d.importeAbonado);
        d.saldo = Math.round(d.importeAbonado - d.importeCobrado);
      } else {
        d.importeCobrado = montoCobrandoCab;
        d.saldo = Math.round(d.importeCobrado - d.importeAbonado);
      }
    });

    const cobranza = this.st.cobranza()!;
    if ((cobranza.importeCobrado ?? 0) > this.st.totalAbonado()) {
      this.invalido('Monto abonado menor a monto a pagar'); return;
    }

    const pedidoDescuento: any[] = [];
    for (const d of this.st.descuentos()) {
      if (d) pedidoDescuento.push({ codDescuento: d.codDescuento, codPedido: null, codPedidoDescuento: null });
    }

    this.st.patchPedido({ cliente: this.st.cliente() ?? undefined });
    const cobActualizada = {
      ...cobranza,
      importeAbonado: this.st.totalAbonado(),
      saldo: (cobranza.importeCobrado ?? 0) - this.st.totalAbonado(),
      detalle: detalles,
    };
    this.st.patchPedido({
      vendedor:       this.st.vendedor() ?? undefined,
      codVendedorErp: this.st.vendedor()?.codVendedorErp ?? '',
      cobranza:       cobActualizada as any,
      porcDescuento:  this.st.porcentajeDescuento(),
      detalle:        this.st.pedidoDetalles() as any,
    });

    const objeto = { pedido: this.st.pedido(), descuentos: pedidoDescuento };
    this.st.guardando.set(true);

    const obs$ = this.st.modoEdicion()
      ? this.pedSvc.update(objeto)
      : this.pedSvc.create(objeto);

    obs$.subscribe({
      next: () => {
        this.st.guardando.set(false);
        this.st.oculto.set('oculto');
        this.toast.success('Pedido guardado con cobranza.');
        this.limpiar();
        this.init();
      },
      error: (err: any) => {
        this.st.guardando.set(false);
        this.invalido('Error al guardar cobranza.');
      }
    });
  }

  // ── editarPedido — fiel al ng12 ───────────────────────────────────────────
  async editarPedido(item: any): Promise<void> {
    if (!confirm('¿Seguro que desea cargar este pedido?')) return;
    this.st.descuentos.set([]);
    const modeloPedido: any = await firstValueFrom(this.pedSvc.getById(item.codPedido)).catch(() => null);
    if (!modeloPedido) { this.invalido('No se pudo cargar el pedido'); return; }

    const pedido = modeloPedido.pedido ?? modeloPedido;
    this.st.pedido.set(pedido);
    const cli = pedido.cliente as Cliente;
    this.st.cliente.set(cli);
    this.st.razonSocial.set(cli.concatDocNombre ?? '');

    if (pedido.tipoPedido !== 'POS') {
      const lpe: any = await firstValueFrom(this.lpSvc.getListEcommerce()).catch(() => null);
      if (!lpe) { this.router.navigate(['/dashboard']); this.invalido('Para pedidos externos es necesario la lista de tipo ecommerce'); return; }
      this.st.listaPrecio.set(lpe);
    } else {
      this.st.listaPrecio.set(cli.listaPrecio);
      if (!cli.listaPrecio) { this.router.navigate(['/dashboard']); this.invalido('El cliente no tiene lista precio'); return; }
    }

    this.st.pedidoDetalles.set(pedido.detalle ?? []);
    this.st.porcentajeDescuento.set(pedido.porcDescuento ?? 0);

    for (const pd of modeloPedido.descuentos ?? []) {
      const desc: any = await firstValueFrom(this.descSvc.getDescuentoById(pd.codDescuento)).catch(() => null);
      if (desc) {
        if (desc.tipoDescuento === 'IMPORTE')   this.st.descuentoImporteActual.set(desc);
        if (desc.tipoDescuento === 'SUCURSAL')  this.st.descuentoSucursalActual.set(desc);
        if (desc.tipoDescuento === 'CLIENTE')   this.st.descuentoClienteActual.set(desc);
        this.st.pushDescuento(desc);
      }
    }

    if (pedido.cobranza) this.st.cobranzaAux.set(pedido.cobranza);
    this.st.modoEdicion.set(true);
    this.st.pedidoEditando.set(pedido.codPedido);

    if (pedido.tipoPedido === 'POS') await this.reHacer();
    this.st.modalPedidos.set('oculto');
  }

  // ── Modal pedidos (cargar) ────────────────────────────────────────────────
  async mostrarModalPedidos(): Promise<void> {
    const total = this.st.pedido()?.importeTotal ?? 0;
    if (total > 0) { this.invalido('Ya existe un pedido en proceso'); return; }
    this.st.nroPedido.set(0);
    this.st.modalPedidos.set('');
    this.st.paginaPedido.set(1);
    const today = new Date().toISOString().slice(0, 10);
    this.st.fechaInicio.set(today);
    this.st.fechaFin.set(today);
    this.st.clienteFiltro.set(null);
    await this._cargarPedidosPendientes(0);
  }

  async buscarPedido(): Promise<void> {
    this.st.paginaPedido.set(1);
    await this._cargarPedidosPendientes(0);
  }

  async cargarPaginaPedidos(page: number): Promise<void> {
    await this._cargarPedidosPendientes(page - 1);
  }

  cancelarModalPedidos(): void {
    this.st.nroPedido.set(0);
    this.st.modalPedidos.set('oculto');
  }

  private async _cargarPedidosPendientes(page: number): Promise<void> {
    let codSuc = 0;
    if (this.user.authorities?.[0] === 'ROLE_CAJERO') codSuc = this.user.codSucursal;
    const r: any = await firstValueFrom(
      this.pedSvc.findByFecha(
        page, this.st.fechaInicio(), this.st.fechaFin(),
        this.st.clienteFiltro(), null, codSuc,
        10, 'PENDIENTE', false, '', this.st.nroPedido()
      )
    ).catch(() => null);
    if (!r) return;
    this.st.listaPedidos.set(r.content ?? []);
    this.st.totalElementosPed.set(r.totalElements ?? 0);
    this.st.pageSizePed.set(10);
  }

  // ── Cambio canal / sucursal ───────────────────────────────────────────────
  cambioCanal(canal: any): void {
    if (canal) { this.st.canal.set(canal); this.st.patchPedido({ canal }); }
  }

  async cambioSucursal(sucursal: any): Promise<void> {
    if (!sucursal) return;
    this.st.sucursal.set(sucursal);
    this.st.patchPedido({ codSucursal: sucursal.codSucursal, codSucursalErp: sucursal.codSucursalErp });
    // ng12: actualizar sesión del usuario con la nueva sucursal y refrescar token
    const updated: any = await firstValueFrom(
      this.auth.changeSucursal(sucursal.codSucursal)
    ).catch(() => null);
    if (updated) {
      await firstValueFrom(this.auth.refreshToken()).catch(() => null);
    }
  }

  buscarClientes(q: string): void {
    if (!q || q.length < 2) { this.st.clientes.set([]); return; }
    this.cliSvc.getAll({ keyword: q.toUpperCase(), page: 0, size: 16 }).subscribe({
      next: (r: any) => this.st.clientes.set(Array.isArray(r) ? r : (r?.content ?? []))
    });
  }

  private cargarClientesIniciales(): void {
    this.cliSvc.getAll({ keyword: '', page: 0, size: 16 }).subscribe({
      next: (r: any) => this.st.clientes.set(Array.isArray(r) ? r : (r?.content ?? []))
    });
  }

  cancelarBusqueda(): void {
    // Si hay cliente activo, volver a mostrarlo; si no, la búsqueda queda visible
    if (this.st.cliente()) {
      this.st.mostrarCliente.set(true);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVADOS — lógica de cálculo
  // ══════════════════════════════════════════════════════════════════════════


  /** Recibe payload desde app-pos-cobranza y guarda */
  guardarCobranzaConPayload(payload: { cobranzasDetalle: any[]; totalAbonado: number; vuelto: number }): void {
    const { cobranzasDetalle, totalAbonado } = payload;

    // Calcular importeCobrado en cada detalle — misma lógica que guardarCobranza()
    let montoCobrandoCab = this.st.pedido()?.importeTotal ?? 0;
    const detalles = cobranzasDetalle.map(d => {
      let det = { ...d };
      if (montoCobrandoCab > det.importeAbonado) {
        det.importeCobrado = det.importeAbonado;
        montoCobrandoCab = Math.round(montoCobrandoCab - det.importeAbonado);
        det.saldo = Math.round(det.importeAbonado - det.importeCobrado);
      } else if (montoCobrandoCab === det.importeAbonado) {
        det.importeCobrado = det.importeAbonado;
        montoCobrandoCab = Math.round(montoCobrandoCab - det.importeAbonado);
        det.saldo = Math.round(det.importeAbonado - det.importeCobrado);
      } else {
        det.importeCobrado = montoCobrandoCab;
        det.saldo = Math.round(det.importeCobrado - det.importeAbonado);
      }
      return det;
    });

    const pedidoDescuento: any[] = this.st.descuentos()
      .filter(d => d)
      .map(d => ({ codDescuento: d.codDescuento, codPedido: null, codPedidoDescuento: null }));

    const cobActualizada = {
      ...(this.st.cobranza() ?? {}),
      importeAbonado: totalAbonado,
      saldo: (this.st.pedido()?.importeTotal ?? 0) - totalAbonado,
      detalle: detalles,
    };
    this.st.patchPedido({
      cliente:        this.st.cliente() ?? undefined,
      vendedor:       this.st.vendedor() ?? undefined,
      codVendedorErp: this.st.vendedor()?.codVendedorErp ?? '',
      cobranza:       cobActualizada as any,
      porcDescuento:  this.st.porcentajeDescuento(),
      detalle:        this.st.pedidoDetalles() as any,
    });

    const objeto = { pedido: this.st.pedido(), descuentos: pedidoDescuento };
    this.st.guardando.set(true);

    const obs$ = this.st.modoEdicion() ? this.pedSvc.update(objeto) : this.pedSvc.create(objeto);
    obs$.subscribe({
      next: () => {
        this.st.guardando.set(false);
        this.toast.success('Pedido guardado con cobranza.');
        this.limpiar();
        this.init();
      },
      error: () => { this.st.guardando.set(false); this.invalido('Error al guardar cobranza.'); }
    });
  }


  // ── Modal observación ─────────────────────────────────────────────────────
  mostrarModalObservacion(): void { this.st.mostrarModal.set(true); }
  cerrarModalObs(): void { this.st.mostrarModal.set(false); }

  // ── Modal cliente ─────────────────────────────────────────────────────────
  mostrarModalCliente(): void { this.st.modalCliente.set(''); }
  cerrarModalCliente(): void { this.st.modalCliente.set('oculto'); }

  // ── Modal canal ───────────────────────────────────────────────────────────
  mostrarModalCanal(): void { this.st.modalCanal.set(''); }
  cerrarModalCanal(): void { this.st.modalCanal.set('oculto'); }

  // ── Filtro cliente en modal pedidos ───────────────────────────────────────
  seleccionCliente(cliente: any): void { this.st.clienteFiltro.set(cliente); }

  private async _aplicarDescuentoDetalle(det: PedidoDetalle, codLP: number): Promise<PedidoDetalle> {
    const pd: any = await firstValueFrom(this.descSvc.getDescuento('PRODUCTO', det.producto.codProducto, det.cantidad, codLP)).catch(() => null);
    if (pd) {
      det = { ...det, tipoDescuento: 'PRODUCTO' };
      if (pd.unidadDescuento === 'PORCENTAJE') {
        det.porcDescuento    = pd.descuento;
        det.importeDescuento = Math.round(det.subTotal * det.porcDescuento / 100);
        det.importeTotal     = det.subTotal - det.importeDescuento;
      } else {
        const aux = pd.descuento * det.cantidad;
        det.porcDescuento    = Math.round(aux * 100 / det.subTotal);
        det.importeDescuento = aux;
      }
      return det;
    }

    const u2: any = await firstValueFrom(this.descSvc.getDescuento('UNO_DE_DOS', det.producto.codProducto, det.cantidad, codLP)).catch(() => null);
    if (u2) {
      det = { ...det, tipoDescuento: 'UNO_DE_DOS' };
      if (det.cantidad >= 2) {
        det.porcDescuento    = u2.descuento;
        const n = Math.floor(det.cantidad / 2);
        const disc = Math.round(det.importePrecio * det.porcDescuento / 100);
        det.importeDescuento = Math.round(n * disc);
        det.importeTotal     = det.subTotal - det.importeDescuento;
      }
      return det;
    }

    const u3: any = await firstValueFrom(this.descSvc.getDescuento('UNO_DE_TRES', det.producto.codProducto, det.cantidad, codLP)).catch(() => null);
    if (u3) {
      det = { ...det, tipoDescuento: 'UNO_DE_TRES' };
      if (det.cantidad >= 3) {
        det.porcDescuento    = u3.descuento;
        const n = Math.floor(det.cantidad / 3);
        const disc = Math.round(det.importePrecio * det.porcDescuento / 100);
        det.importeDescuento = Math.round(n * disc);
        det.importeTotal     = det.subTotal - det.importeDescuento;
      }
      return det;
    }

    // fallback
    const dSuc  = this.st.descuentoSucursalActual();
    const dCli  = this.st.descuentoClienteActual();
    const tipo  = dSuc ? 'SUCURSAL' : dCli ? 'CLIENTE' : 'IMPORTE';
    det = { ...det, tipoDescuento: tipo };
    det.importeDescuento = Math.round(det.subTotal * this.st.porcentajeDescuento() / 100);
    return det;
  }

  private _calcularIva(det: PedidoDetalle): PedidoDetalle {
    switch (det.porcIva) {
      case 0: return { ...det, importeIva5: 0, importeIva10: 0,
                       importeIvaExenta: det.importeTotal, importeNeto: det.importeTotal };
      case 5: {
        const iva5 = Math.round(det.importeTotal / 21);
        return { ...det, importeIva5: iva5, importeIva10: 0,
                 importeIvaExenta: 0, importeNeto: det.importeTotal - iva5 };
      }
      case 10: {
        if (det.producto.ivaEspecial) {
          const exenta = Math.round(det.importeTotal / 2.1);
          const grav   = Math.round(exenta * 1.1);
          const iva10  = Math.round(grav / 11);
          return { ...det, importeIvaExenta: exenta, importeIva10: iva10,
                   importeIva5: 0, importeNeto: det.importeTotal - iva10 };
        }
        const iva10 = Math.round(det.importeTotal / 11);
        return { ...det, importeIva10: iva10, importeIva5: 0,
                 importeIvaExenta: 0, importeNeto: det.importeTotal - iva10 };
      }
      default: return det;
    }
  }

  private _reHacerTotal(): void {
    let sub = 0, desc = 0, iva5 = 0, iva10 = 0, exenta = 0, neto = 0, total = 0, kg = 0, descProd = 0;
    let descontable = 0, totalCant = 0;
    for (const det of this.st.pedidoDetalles()) {
      totalCant += det.cantidad;
      sub   += det.subTotal;
      iva5  += det.importeIva5;
      iva10 += det.importeIva10;
      exenta += det.importeIvaExenta;
      kg    += det.totalKg;
      neto  += det.importeNeto;
      total += det.importeTotal;
      if (!det.producto.sinDescuento) {
        if (det.porcDescuento === 0) {
          descontable += det.subTotal;
          desc        += det.importeDescuento;
        } else {
          // ng12: porcDescuento > 0 → no suma desc (ya tiene su propio descuento)
        }
        if (['PRODUCTO','UNO_DE_DOS','UNO_DE_TRES'].includes(det.tipoDescuento))
          descProd += det.importeDescuento;
      } else {
        // ng12: sinDescuento → importeDescuento = 0 en la suma
      }
    }
    this.st.calculoTotalCantidad.set(totalCant);
    this.st.importeDescontable.set(descontable);
    this.st.patchPedido({
      subTotal: sub, importeDescuento: desc,
      importeIva5: iva5, importeIva10: iva10, importeIvaExenta: exenta,
      importeNeto: neto, importeTotal: total, totalKg: kg, descuentoProducto: descProd,
    } as any);
  }

  private async _calcularDescuentoImporte(): Promise<void> {
    if (!this.st.analizarDescuentoImporte() ||
        this.st.tieneDescuentoSucursal() ||
        this.st.tieneDescuentoCliente() ||
        this.st.tieneDescuentoGrupo()) return;

    const lp     = this.st.listaPrecio()!;
    const dNuevo: any = await firstValueFrom(
      this.descSvc.getDescuento('IMPORTE', 1, this.st.importeDescontable(), lp.codListaPrecio)
    ).catch(() => null);

    const descuentos = this.st.descuentos();
    const idx        = descuentos.findIndex(d => d.tipoDescuento === 'IMPORTE');
    const dActual    = this.st.descuentoImporteActual();
    const limite     = this.st.limitePorcentajeDescuento();
    let   porc       = this.st.porcentajeDescuento();

    if (dNuevo) {
      if (dActual) {
        if (dActual.descuento === dNuevo.descuento) {
          // condición 1 — igual, no hacer nada
        } else if (dActual.descuento > dNuevo.descuento) {
          // condición 2 — nuevo menor
          porc = porc - descuentos[idx].descuento;
          this.st.descuentos.update(a => a.filter((_, i) => i !== idx));
          porc += dNuevo.descuento;
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
          this.st.porcentajeDescuento.set(porc);
        } else if (limite >= (porc - descuentos[idx].descuento + dNuevo.descuento)) {
          // condición 3 — nuevo mayor y cabe
          porc = porc - descuentos[idx].descuento;
          this.st.descuentos.update(a => a.filter((_, i) => i !== idx));
          porc += dNuevo.descuento;
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
          this.st.porcentajeDescuento.set(porc);
        } else {
          // condición 4 — recortar al límite
          porc = porc - descuentos[idx].descuento;
          this.st.descuentos.update(a => a.filter((_, i) => i !== idx));
          dNuevo.descuento = limite - porc;
          porc += dNuevo.descuento;
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
          this.st.porcentajeDescuento.set(porc);
        }
      } else {
        if (limite >= porc + dNuevo.descuento) {
          porc += dNuevo.descuento;
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
          this.st.porcentajeDescuento.set(porc);
        } else {
          dNuevo.descuento = limite - porc;
          porc += dNuevo.descuento;
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
          this.st.porcentajeDescuento.set(porc);
        }
      }
    } else if (dActual) {
      const idxQ = descuentos.findIndex(d => d.tipoDescuento === 'IMPORTE' && (d as any).cantDesde > this.st.importeDescontable());
      if (idxQ > -1) {
        this.st.porcentajeDescuento.update(p => p - descuentos[idxQ].descuento);
        this.st.descuentos.update(a => a.filter((_, i) => i !== idxQ));
        this.st.descuentoImporteActual.set(null);
      }
    }
  }

  private async _reHacerDetallesPorPrecio(): Promise<void> {
    const cli = this.st.cliente()!;
    const lp  = this.st.listaPrecio()!;
    const toRemove: number[] = [];

    for (let i = 0; i < this.st.pedidoDetalles().length; i++) {
      const det = this.st.pedidoDetalles()[i];
      const precio: any = await firstValueFrom(
        this.precSvc.getPrecio(det.cantidad, det.producto.codProducto, lp.codListaPrecio, cli.codCliente)
      ).catch(() => null);

      if (precio) {
        let importePrecio = precio.precio;
        if (cli.excentoIva) {
          if (det.producto.iva === 5)  importePrecio = precio.precio - Math.round(precio.precio / 21);
          if (det.producto.iva === 10) importePrecio = precio.precio - Math.round(precio.precio / 11);
        }
        const subTotal = det.cantidad * importePrecio;
        let updated: PedidoDetalle = {
          ...det, importePrecio,
          totalKg: det.cantidad * (det.producto.peso ?? 0),
          subTotal, porcDescuento: 0, importeDescuento: 0,
        };
        if (!det.producto.sinDescuento) {
          updated = await this._aplicarDescuentoDetalle(updated, lp.codListaPrecio);
        }
        updated.importeTotal = updated.subTotal - updated.importeDescuento;
        if (!cli.excentoIva) {
          updated = this._calcularIva(updated);
        } else {
          updated = { ...updated, porcIva: 0, importeIva5: 0, importeIva10: 0,
                      importeIvaExenta: updated.importeTotal, importeNeto: updated.importeTotal };
        }
        this.st.updateDetalle(i, updated);
      } else {
        // ng12: elimina del array si no tiene precio
        toRemove.push(i);
        this.invalido('El producto no tiene precio');
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--)
      this.st.removeDetalle(toRemove[i]);
  }

  private async _reHacerDetalles(): Promise<void> {
    const cli = this.st.cliente()!;
    const lp  = this.st.listaPrecio()!;
    for (let i = 0; i < this.st.pedidoDetalles().length; i++) {
      const det = this.st.pedidoDetalles()[i];
      const subTotal = det.cantidad * det.importePrecio;
      let updated: PedidoDetalle = { ...det, subTotal, porcDescuento: 0, importeDescuento: 0 };
      if (!det.producto.sinDescuento) {
        updated = await this._aplicarDescuentoDetalle(updated, lp.codListaPrecio);
      }
      updated.totalKg      = det.cantidad * (det.producto.peso ?? 0);
      updated.importeTotal = updated.subTotal - updated.importeDescuento;
      if (!cli.excentoIva) {
        updated = this._calcularIva(updated);
      } else {
        updated = { ...updated, porcIva: 0, importeIva5: 0, importeIva10: 0,
                    importeIvaExenta: updated.importeTotal, importeNeto: updated.importeTotal };
      }
      this.st.updateDetalle(i, updated);
    }
  }
}