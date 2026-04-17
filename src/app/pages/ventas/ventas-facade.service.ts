// VentasFacade — toda la lógica de negocio del POS
// El componente llama métodos de aquí. No sabe de HTTP.
// El estado vive en VentasStateService.
import { Injectable, inject } from '@angular/core';
import { Router }               from '@angular/router';
import { firstValueFrom }       from 'rxjs';

import { AuthService }          from '../../core/services/auth.service';
import { VentasService }        from '../../core/services/domain/ventas.service';
import { ClienteService }       from '../../core/services/domain/cliente.service';
import { ProductoService }      from '../../core/services/domain/producto.service';
import { FormaVentaService }    from '../../core/services/domain/forma-venta.service';
import { MedioPagoService }     from '../../core/services/domain/medio-pago.service';
import { TipoMedioPagoService } from '../../core/services/domain/tipo-medio-pago.service';
import { BancosService }        from '../../core/services/domain/bancos.service';
import { TerminalesService }    from '../../core/services/domain/terminales.service';
import { CanalService }         from '../../core/services/domain/canal.service';
import { CategoriaService }     from '../../core/services/domain/categoria.service';
import { PrecioService }        from '../../core/services/domain/precio.service';
import { DescuentoService }     from '../../core/services/domain/descuento.service';
import { BonificacionService }  from '../../core/services/domain/bonificacion.service';
import { VendedorService }      from '../../core/services/domain/vendedor.service';
import { DepositoService }      from '../../core/services/domain/deposito.service';
import { StockService }         from '../../core/services/domain/stock.service';
import { ComprobantesService }  from '../../core/services/domain/comprobantes.service';
import { SucursalService }      from '../../core/services/domain/sucursal.service';
import { ListaPrecioService }   from '../../core/services/domain/lista-precio.service';
import { PedidosService }       from '../../core/services/domain/pedidos.service';
import { ToastService }         from '../../shared/components/toast/toast.service';

import { VentasStateService }   from './ventas-state.service';
import { CuponService }         from '../../core/services/domain/cupon.service';
import { InfluencerService }    from '../../core/services/domain/influencer.service';
import { VentaDraftService }   from './venta-draft.service';

import { Venta }          from '../../core/models/domain/venta.model';
import { VentaDetalle }   from '../../core/models/domain/venta-detalle.model';
import { Descuento }      from '../../core/models/domain/descuento.model';
import { Cliente }        from '../../core/models/domain/cliente.model';
import { Terminales }     from '../../core/models/domain/terminales.model';
import { FormaVenta }     from '../../core/models/domain/forma-venta.model';
import { Canal }          from '../../core/models/domain/canal.model';
import { Precio }         from '../../core/models/domain/precio.model';
import { Stock }          from '../../core/models/domain/stock.model';

@Injectable()
export class VentasFacadeService {

  // Servicios de dominio
  readonly auth     = inject(AuthService);
  private cuponSvc    = inject(CuponService);
  private influSvc    = inject(InfluencerService);
  readonly draft   = inject(VentaDraftService);
  private ventaSvc = inject(VentasService);
  private cliSvc   = inject(ClienteService);
  private prodSvc  = inject(ProductoService);
  private fvSvc    = inject(FormaVentaService);
  private mpSvc    = inject(MedioPagoService);
  private tmpSvc   = inject(TipoMedioPagoService);
  private bancoSvc = inject(BancosService);
  private termSvc  = inject(TerminalesService);
  private canalSvc = inject(CanalService);
  private catSvc   = inject(CategoriaService);
  private precSvc  = inject(PrecioService);
  private descSvc  = inject(DescuentoService);
  private bonifSvc = inject(BonificacionService);
  private vendSvc  = inject(VendedorService);
  private depSvc   = inject(DepositoService);
  private stockSvc = inject(StockService);
  private compSvc  = inject(ComprobantesService);
  private sucSvc   = inject(SucursalService);
  private lpSvc    = inject(ListaPrecioService);
  private pedSvc   = inject(PedidosService);
  private toast    = inject(ToastService);
  private router   = inject(Router);
  readonly st      = inject(VentasStateService);   // estado

  // ── Acceso a session ──────────────────────────────────────
  get user() { return this.auth.session!; }

  // ══════════════════════════════════════════════════════════
  //  TERMINAL
  // ══════════════════════════════════════════════════════════
  async initTerminal(): Promise<void> {
    const tv = this.auth.terminal;
    if (tv?.codTerminalVenta > 0) {
      const ok = await firstValueFrom(this.termSvc.getById(tv.codTerminalVenta)).catch(() => null);
      if (ok) { this.st.terminal.set(tv); this.st.autorizado.set(true); await this.cargar(); return; }
    }
    await this.cargarTerminales();
  }

  async cargarTerminales(): Promise<void> {
    const r = await firstValueFrom(this.termSvc.traerterminalesDisponibles(this.user.codEmpresa, 0)).catch(() => []);
    const list: Terminales[] = Array.isArray(r) ? r : [];
    this.st.terminales.set(list);
    const idx = list.findIndex(t => t.codSucursal === this.user.codSucursal);
    const t   = list[idx >= 0 ? idx : 0] ?? null;
    if (t) this.st.terminal.set(t);
    this.st.modalTerminal.set(true);
  }

  async guardarTerminal(codTerminal: number): Promise<void> {
    const list = this.st.terminales();
    const t    = list.find(x => x.codTerminalVenta == codTerminal);
    if (!t) return;
    // Si la terminal es de otra sucursal, cambiar en servidor
    if (t.codSucursal && t.codSucursal !== this.user.codSucursal) {
      await firstValueFrom(this.auth.changeSucursal(t.codSucursal)).catch(() => null);
    }
    const termConId: Terminales = { ...t, id: this._uuid() };
    this.auth.saveTerminal(termConId);
    this.st.terminal.set(termConId);
    this.st.modalTerminal.set(false);
    this.st.autorizado.set(true);
    this.toast.success(`Terminal ${t.descripcion} registrada`);
    await this.cargar();
  }

  // ══════════════════════════════════════════════════════════
  //  CARGA INICIAL
  // ══════════════════════════════════════════════════════════
  async cargar(): Promise<void> {
    const codEmp = this.user.codEmpresa;
    const codSuc = this.user.codSucursal;
    const term   = this.st.terminal();

    const [comp, dep, catsRaw, suc, canalesRaw, vend, cliDef] = await Promise.all([
      firstValueFrom(this.compSvc.getComprobanteByTerminalId(term!.codTerminalVenta)).catch(() => null),
      firstValueFrom(this.depSvc.getDepositoVenta(codEmp, codSuc)).catch(() => null),
      firstValueFrom(this.catSvc.getAll({ codempresa: codEmp })).catch(() => null),
      firstValueFrom(this.sucSvc.getById(codSuc)).catch(() => null),
      firstValueFrom(this.canalSvc.getAll({ codempresa: codEmp })).catch(() => []),
      firstValueFrom(this.vendSvc.getByCodUser(this.user.codUsuario)).catch(() => null),
      firstValueFrom(this.cliSvc.getClienteDefault()).catch(() => null),
    ]);

    if (!dep) { this.toast.error('Sucursal sin depósito de ventas'); return; }
    if (!cliDef) { this.toast.error('No existe cliente predeterminado'); return; }

    this.st.comprobante.set(comp);
    this.st.deposito.set(dep);
    this.st.vendedor.set(vend);
    this.st.limitePorcentajeDescuento.set(this.user.maxDescuentoPorc ?? 100);
    this.st.porcentajeDescuento.set(0);

    // Categorías + "Todos"
    const cats = Array.isArray(catsRaw) ? catsRaw : (catsRaw ?? []);
    const todos = { codCategoriaProducto: 0, descripcion: 'Todos', codCategoriaProductoErp: '99', codEmpresa: codEmp };
    this.st.categorias.set([todos, ...cats]);

    const canales: Canal[] = Array.isArray(canalesRaw) ? canalesRaw : [];
    this.st.canales.set(canales);

    await this._setCliente(cliDef);
    await this._cargarFormaVenta(cliDef.formaVentaPref);

    // Canal principal
    const cp = await firstValueFrom(this.canalSvc.getCanalPrincipal()).catch(() => null);
    const canalActivo = cp ?? canales[0] ?? null;
    this.st.canal.set(canalActivo);
    this.st.patchVenta({ canal: canalActivo ?? undefined, deposito: dep, listaPrecio: cliDef.listaPrecio });

    const descImp = await firstValueFrom(this.descSvc.getDescuentoByTipo('IMPORTE', cliDef.listaPrecio.codListaPrecio)).catch(() => null);
    this.st.analizarDescuentoImporte.set(!!descImp);
    this.st.descuentos.set([]);
    await this._buscarDescuentos();

    this.st.mostrarCliente.set(true);
    this.st.buscadorHabilitado.set(true);
    this.cargarProductos(0, '', 0);
  }

  // ══════════════════════════════════════════════════════════
  //  CLIENTE
  // ══════════════════════════════════════════════════════════
  async buscarClientes(q: string): Promise<void> {
    if (!q || q.length < 2) { this.st.clientes.set([]); return; }
    const r: any = await firstValueFrom(this.cliSvc.getAll({ keyword: q.toUpperCase(), page: 0, size: 16 })).catch(() => null);
    // La API devuelve un objeto Page {content:[...]} — extraer el array correctamente
    this.st.clientes.set(Array.isArray(r) ? r : (r?.content ?? []));
  }

  async seleccionarCliente(item: Cliente): Promise<void> {
    // ── Validación email (ng12: redirige si cliente no predeterminado sin email) ──
    if (!item.predeterminado) {
      if (!item.email) {
        this.toast.error('El cliente no posee email. Se abrirá el formulario en nueva pestaña — completá los datos y volvé a buscarlo.');
        // Abrir en nueva pestaña para no destruir el carrito actual
        window.open(`/clientes/formulario/${item.codCliente}`, '_blank');
        return;
      }
    }

    this.st.resetDescuentos();
    this.st.limitePorcentajeDescuento.set(this.user.maxDescuentoPorc ?? 100);
    const dep = await firstValueFrom(this.depSvc.getDepositoVenta(this.user.codEmpresa, this.user.codSucursal)).catch(() => this.st.deposito());
    this.st.deposito.set(dep);
    this._initVenta();
    await this._setCliente(item);
    await this._cargarFormaVenta(item.formaVentaPref);
    const descImp = await firstValueFrom(this.descSvc.getDescuentoByTipo('IMPORTE', item.listaPrecio.codListaPrecio)).catch(() => null);
    this.st.analizarDescuentoImporte.set(!!descImp);
    await this._buscarDescuentos();
    this.st.mostrarCliente.set(true);
    this.st.buscadorHabilitado.set(true);

    // Recuperar detalles guardados temporalmente en IDB al cambiar de cliente
    const savedDraft = await this.draft.loadDraft();
    if (savedDraft?.detalles?.length) {
      this.st.ventaDetalles.set(savedDraft.detalles);
      // Draft recuperado al cambiar de cliente — los detalles del carrito se preservan entre cambios
      await this.draft.clearDraft();
    }

    // Recalcular precios y descuentos con el nuevo cliente
    if (this.st.ventaDetalles().length > 0) {
      await this._reHacerDetallesPorPrecio();
      await this.reHacerVenta();
    }
    this.cargarProductos(0, '', 0);
  }

  /** Solo muestra el buscador sin limpiar estado — para carrito vacío (cancelable sin pérdida) */
  mostrarBuscadorCliente(): void {
    this.st.mostrarCliente.set(false);
    this.st.buscadorHabilitado.set(false);
    this._cargarClientesIniciales();
  }

  cambiarCliente(): void {
    this.st.mostrarCliente.set(false);
    this.st.buscadorHabilitado.set(false);  // bloquear catálogo hasta que se elija cliente
    this.st.ventaDetalles.set([]);
    this.st.descuentos.set([]);
    this.st.porcentajeDescuento.set(0);
    this._initVenta();
    this._cargarClientesIniciales();
  }

  private _cargarClientesIniciales(): void {
    this.cliSvc.getAll({ keyword: '', page: 0, size: 16 }).subscribe({
      next: (r: any) => this.st.clientes.set(Array.isArray(r) ? r : (r?.content ?? []))
    });
  }

  cancelarCambiocliente(): void {
    this.st.mostrarCliente.set(true);
    this.st.buscadorHabilitado.set(true);
    // Si los productos se vaciaron (por cambiarCliente previo), recargar
    if (this.st.productos().length === 0 && this.st.cliente()) {
      this.cargarProductos(0, '', 0);
    }
  }

  async guardarDetallesTemporal(): Promise<void> {
    const dep = this.st.deposito();
    if (dep) await firstValueFrom(this.stockSvc.cancelarComprometido(dep.codDeposito, this.st.ventaDetalles())).catch(() => null);
    // IndexedDB guarda objetos nativos — sin serialización, sin problema de circular refs
    await this.draft.saveDraft({
      detalles:            this.st.ventaDetalles(),
      descuentos:          this.st.descuentos(),
      porcentajeDescuento: this.st.porcentajeDescuento(),
      cliente:             this.st.cliente(),
      canal:               this.st.canal(),
      modoEntrega:         this.st.venta()?.modoEntrega ?? 'CONTRA_ENTREGA',
      listaPrecio:         this.st.listaPrecio(),
      formaVenta:          this.st.formaVenta(),
      vendedor:            this.st.vendedor(),
      cuponPromo:          this.st.cuponPromo(),
      pedido:              this.st.pedido(),
    });
    this.cambiarCliente();
  }

  // ══════════════════════════════════════════════════════════
  //  PRODUCTOS
  // ══════════════════════════════════════════════════════════
  cargarProductos(page: number, termino: string, codCategoria: number): void {
    this.st.cargandoProds.set(true);
    const params: Record<string, any> = { codempresa: this.user.codEmpresa, page, size: 14, activo: true };
    if (termino && termino.length > 2) params['keyword'] = termino.toUpperCase();
    if (codCategoria > 0) params['codcategoria'] = codCategoria;
    this.prodSvc.getAll(params).subscribe({
      next: (r: any) => {
        const prods = Array.isArray(r) ? r : (r.content ?? []);
        this.st.productos.set(prods);
        this.st.totalElementos.set(r.totalElements ?? prods.length);
        this.st.cantidadElementos.set(r.size ?? 14);
        this.st.pagina.set(r.number ?? page);
        this.st.cargandoProds.set(false);
        // Autoselect si un único resultado y búsqueda precisa
        if (prods.length === 1 && termino.length > 8) {
          this.seleccionarProducto(prods[0], 1);
          this.cargarProductos(0, '', 0);
        }
      },
      error: () => this.st.cargandoProds.set(false),
    });
  }

  // ══════════════════════════════════════════════════════════
  //  AGREGAR / QUITAR PRODUCTOS
  // ══════════════════════════════════════════════════════════
  async seleccionarProducto(producto: any, cantidad: number): Promise<void> {
    if (cantidad <= 0) { this.toast.error('Cantidad debe ser mayor a 0'); return; }
    const dep    = this.st.deposito()!;
    const lp     = this.st.listaPrecio()!;
    const cli    = this.st.cliente()!;
    const comp   = this.st.comprobante();
    const detalles = this.st.ventaDetalles();

    let stock: Stock | null = null;
    if (producto.inventariable) {
      stock = await firstValueFrom(this.stockSvc.traerStock(dep.codDeposito, producto.codProducto)).catch(() => null);
      if (!stock) { this.toast.error('Producto inventariable sin stock'); return; }
    }

    let idx = detalles.findIndex(d => d.producto.codProducto === producto.codProducto);
    if (idx === -1) {
      if (comp && comp.maxItems <= detalles.length) { this.toast.error('Límite de ítems por factura alcanzado'); return; }
      const precio = await firstValueFrom(this.precSvc.getPrecio(cantidad, producto.codProducto, lp.codListaPrecio, cli.codCliente)).catch(() => null);
      if (!precio) { this.toast.error('El producto no tiene precio'); return; }
      const nuevo: VentaDetalle = {
        codVentaDetalle: null as any, nroItem: detalles.length + 1, cantidad: 0,
        importeDescuento: 0, importeIva5: 0, importeIva10: 0, importeIvaExenta: 0,
        importeNeto: 0, importePrecio: 0, importeTotal: 0, subTotal: 0, totalKg: 0,
        porcDescuento: 0, porcIva: 0, producto, unidadMedida: null as any,
        venta: null, vendedor: this.st.vendedor()!, codVendedorErp: this.st.vendedor()?.codVendedorErp ?? '',
        tipoDescuento: 'NINGUNO',
      };
      this.st.pushDetalle(nuevo);
      idx = this.st.ventaDetalles().length - 1;
    }

    // Actualizar cantidad
    const detallesNow = this.st.ventaDetalles();
    const det = { ...detallesNow[idx], cantidad: detallesNow[idx].cantidad + cantidad };
    this.st.updateDetalle(idx, det);

    // Verificar stock disponible
    if (producto.inventariable && stock) {
      const disponible = stock.existencia - stock.comprometido;
      if (cantidad > disponible) {
        const cantSafe = detallesNow[idx].cantidad;
        this.st.updateDetalle(idx, { ...det, cantidad: cantSafe - cantidad });
        if (cantSafe - cantidad <= 0) this.st.removeDetalle(idx);
        this.toast.error('Sin stock disponible');
        return;
      }
      this.stockSvc.update({ ...stock, comprometido: stock.comprometido + cantidad }).subscribe();
    }

    const precioFinal = await firstValueFrom(
      this.precSvc.getPrecio(this.st.ventaDetalles()[idx].cantidad, producto.codProducto, lp.codListaPrecio, cli.codCliente)
    ).catch(() => null);
    if (!precioFinal) { this.toast.error('El producto no tiene precio'); return; }
    await this._aplicarPrecioYDescuento(idx, precioFinal);
    await this.reHacerVenta();
    this._autosaveDraft(); // guardar snapshot tras cada cambio en el carrito
    this.toast.success(producto.nombreProducto, { title: 'Producto agregado' });
  }

  async restarProducto(item: VentaDetalle): Promise<void> {
    if (item.cantidad <= 1) return;
    const idx = this.st.ventaDetalles().findIndex(d => d === item);
    if (idx < 0) return;
    this.st.updateDetalle(idx, { ...item, cantidad: item.cantidad - 1 });
    this._autosaveDraft();
    if (item.producto.inventariable) {
      const stock = await firstValueFrom(this.stockSvc.traerStock(this.st.deposito()!.codDeposito, item.producto.codProducto)).catch(() => null);
      if (stock) this.stockSvc.update({ ...stock, comprometido: Math.max(0, stock.comprometido - 1) }).subscribe();
    }
    await this._reHacerDetallesPorPrecio();
    await this.reHacerVenta();
  }

  async quitarProductoCompleto(item: VentaDetalle): Promise<void> {
    if (item.producto.inventariable) {
      const stock = await firstValueFrom(this.stockSvc.traerStock(this.st.deposito()!.codDeposito, item.producto.codProducto)).catch(() => null);
      if (stock) this.stockSvc.update({ ...stock, comprometido: Math.max(0, stock.comprometido - item.cantidad) }).subscribe();
    }
    // Quitar descuento de producto si existe
    this.st.removeDescuento(d => d.tipoDescuento === 'PRODUCTO' && (d.producto as any)?.codProducto === item.producto.codProducto);
    const idx = this.st.ventaDetalles().findIndex(d => d === item);
    if (idx >= 0) this.st.removeDetalle(idx);
    this.st.importeDescontable.set(0);
    await this._reHacerDetallesPorPrecio();
    await this.reHacerVenta();
    this.st.ordenarNroItem();
    this._autosaveDraft(); // guardar snapshot tras quitar producto completo
  }

  async quitarDescuento(desc: Descuento): Promise<void> {
    if (desc.tipoDescuento === 'SUCURSAL') this.st.tieneDescuentoSucursal.set(false);
    this.st.porcentajeDescuento.update(p => p - desc.descuento);
    this.st.removeDescuento(d => d === desc);
    await this.reHacerVenta();
    this._autosaveDraft(); // guardar snapshot tras quitar descuento
  }

  // ══════════════════════════════════════════════════════════
  //  CÁLCULOS — precio / descuento / IVA
  // ══════════════════════════════════════════════════════════
  private async _aplicarPrecioYDescuento(idx: number, precio: Precio): Promise<void> {
    const det  = this.st.ventaDetalles()[idx];
    const cli  = this.st.cliente()!;
    let importePrecio = precio.precio;

    if (cli.excentoIva) {
      if (det.producto.iva === 5)  importePrecio = precio.precio - Math.round(precio.precio / 21);
      if (det.producto.iva === 10) importePrecio = precio.precio - Math.round(precio.precio / 11);
    }

    const subTotal = Math.round(det.cantidad * importePrecio);
    const totalKg  = det.cantidad * (det.producto.peso ?? 0);
    let updated: VentaDetalle = { ...det, importePrecio, porcIva: det.producto.iva, unidadMedida: precio.unidadMedida, subTotal, totalKg, importeDescuento: 0, porcDescuento: 0 };
    this.st.updateDetalle(idx, updated);

    if (!det.producto.sinDescuento || this.st.tieneDescuentoClienteFull()) {
      if (this.st.tieneDescuentoClienteFull()) {
        const cupon = this.st.cuponPromo();
        const tipo  = (cupon?.alianza || cupon?.influencer) ? cupon!.cupon : 'CLIENTE_FULL';
        const porc  = this.st.porcentajeDescuento();
        updated = { ...updated, tipoDescuento: tipo, porcDescuento: porc, importeDescuento: Math.round(subTotal * porc / 100) };
      } else {
        await this._cascadaDescuento(idx);
        updated = this.st.ventaDetalles()[idx];
      }
    }
    const extra = this.st.descuentoExtraInfluencer();
    if (det.producto.sinDescuento && extra > 0) {
      updated = { ...updated, porcDescuento: extra, importeDescuento: Math.round(subTotal * extra / 100) };
    }
    updated = { ...updated, importeTotal: updated.subTotal - updated.importeDescuento };
    this.st.updateDetalle(idx, updated);
    this._calcularIva(idx);
    const d2 = this.st.ventaDetalles()[idx];
    if (!d2.tipoDescuento) this.st.updateDetalle(idx, { ...d2, tipoDescuento: 'NINGUNO' });
  }

  private async _cascadaDescuento(idx: number): Promise<void> {
    const det = this.st.ventaDetalles()[idx];
    const lp  = this.st.listaPrecio()!;
    const ext = this.st.descuentoExtraInfluencer();

    const dProd = await firstValueFrom(this.descSvc.getDescuento('PRODUCTO', det.producto.codProducto, det.cantidad, lp.codListaPrecio)).catch(() => null);
    if (dProd) {
      dProd.descuento += ext;
      let upd = { ...det, tipoDescuento: 'PRODUCTO' };
      if (dProd.unidadDescuento === 'PORCENTAJE') {
        upd = { ...upd, porcDescuento: dProd.descuento, importeDescuento: Math.round(det.subTotal * dProd.descuento / 100), importeTotal: det.subTotal - Math.round(det.subTotal * dProd.descuento / 100) };
      } else {
        const aux = dProd.descuento * det.cantidad;
        upd = { ...upd, porcDescuento: Math.round(aux * 100 / det.subTotal), importeDescuento: aux };
      }
      this.st.updateDetalle(idx, upd); return;
    }

    for (const tipo of ['UNO_DE_DOS', 'UNO_DE_TRES'] as const) {
      const dN = await firstValueFrom(this.descSvc.getDescuento(tipo, det.producto.codProducto, det.cantidad, lp.codListaPrecio)).catch(() => null);
      if (dN) {
        const min = tipo === 'UNO_DE_DOS' ? 2 : 3, div = tipo === 'UNO_DE_DOS' ? 2 : 3;
        let upd = { ...det, tipoDescuento: tipo };
        if (det.cantidad >= min) {
          const nd  = Math.floor(det.cantidad / div);
          const imp = Math.round(nd * Math.round(det.importePrecio * dN.descuento / 100));
          upd = { ...upd, porcDescuento: dN.descuento, importeDescuento: imp, importeTotal: det.subTotal - imp };
        }
        this.st.updateDetalle(idx, upd); return;
      }
    }

    // fallback a porcentaje global
    const cupon = this.st.cuponPromo();
    let tipoFallback = 'IMPORTE';
    if (this.st.descuentoSucursalActual())     tipoFallback = 'SUCURSAL';
    else if (this.st.descuentoClienteActual()) tipoFallback = 'CLIENTE';
    else if (cupon?.alianza || cupon?.influencer) tipoFallback = cupon!.cupon;
    const porc = this.st.porcentajeDescuento();
    this.st.updateDetalle(idx, { ...det, tipoDescuento: tipoFallback, importeDescuento: Math.round(det.subTotal * porc / 100) });
  }

  private _calcularIva(idx: number): void {
    const det = this.st.ventaDetalles()[idx];
    const cli = this.st.cliente()!;
    if (cli.excentoIva) {
      this.st.updateDetalle(idx, { ...det, porcIva: 0, importeIva5: 0, importeIva10: 0, importeIvaExenta: det.importeTotal, importeNeto: det.importeTotal });
      return;
    }
    let upd = { ...det };
    switch (det.porcIva) {
      case 0:  upd = { ...upd, importeIva5: 0, importeIva10: 0, importeIvaExenta: det.importeTotal, importeNeto: det.importeTotal }; break;
      case 5:  upd = { ...upd, importeIva5: Math.round(det.importeTotal / 21), importeIva10: 0, importeIvaExenta: 0, importeNeto: det.importeTotal - Math.round(det.importeTotal / 21) }; break;
      case 10:
        if (det.producto.ivaEspecial) {
          const exc = Math.round(det.importeTotal / 2.1);
          const iva = Math.round(Math.round(exc * 1.1) / 11);
          upd = { ...upd, importeIvaExenta: exc, importeIva10: iva, importeIva5: 0, importeNeto: det.importeTotal - iva };
        } else {
          const iva = Math.round(det.importeTotal / 11);
          upd = { ...upd, importeIva10: iva, importeIva5: 0, importeIvaExenta: 0, importeNeto: det.importeTotal - iva };
        }
        break;
    }
    this.st.updateDetalle(idx, upd);
  }

  // ══════════════════════════════════════════════════════════
  //  REHACER TOTALES
  // ══════════════════════════════════════════════════════════
  async reHacerVenta(): Promise<void> {
    this._reHacerTotal();
    await this._calcularDescuentoImporte();
    await this._reHacerDetalles();
    this._reHacerTotal();
  }

  private _reHacerTotal(): void {
    const detalles = this.st.ventaDetalles();
    let subTotal = 0, impDesc = 0, impIva5 = 0, impIva10 = 0, impExenta = 0, impNeto = 0, impTotal = 0, kg = 0, descProd = 0, descontable = 0;
    for (const det of detalles) {
      subTotal  += det.subTotal;
      impIva5   += det.importeIva5;
      impIva10  += det.importeIva10;
      impExenta += det.importeIvaExenta;
      kg        += det.totalKg;
      impNeto   += det.importeNeto;
      impTotal  += det.importeTotal;
      if (!det.producto.sinDescuento || this.st.tieneDescuentoClienteFull()) {
        if (det.porcDescuento === 0 || this.st.tieneDescuentoClienteFull()) {
          descontable += det.subTotal;
          impDesc     += det.importeDescuento;
        }
        if (['PRODUCTO','UNO_DE_DOS','UNO_DE_TRES'].includes(det.tipoDescuento)) descProd += det.importeDescuento;
      } else {
        impDesc += this.st.descuentoExtraInfluencer() > 0 ? Math.round(det.subTotal * det.porcDescuento / 100) : 0;
      }
    }
    this.st.importeDescontable.set(descontable);
    this.st.patchVenta({ subTotal, importeDescuento: impDesc, importeIva5: impIva5, importeIva10: impIva10, importeIvaExenta: impExenta, importeNeto: impNeto, importeTotal: impTotal, totalKg: kg, descuentoProducto: descProd } as any);
  }

  private async _calcularDescuentoImporte(): Promise<void> {
    if (!this.st.analizarDescuentoImporte() || this.st.tieneDescuentoSucursal() || this.st.tieneDescuentoCliente() || this.st.tieneDescuentoGrupo()) return;
    const lp    = this.st.listaPrecio()!;
    const dNuevo = await firstValueFrom(this.descSvc.getDescuento('IMPORTE', 1, this.st.importeDescontable(), lp.codListaPrecio)).catch(() => null);
    const idx    = this.st.descuentos().findIndex(d => d.tipoDescuento === 'IMPORTE');
    const actual = this.st.descuentoImporteActual();

    if (dNuevo) {
      dNuevo.descuento += this.st.descuentoExtraInfluencer();
      if (actual) {
        if (actual.descuento !== dNuevo.descuento) {
          if (idx > -1) { this.st.porcentajeDescuento.update(p => p - this.st.descuentos()[idx].descuento); this.st.removeDescuento((_, i) => i === idx); }
          dNuevo.descuento = Math.min(dNuevo.descuento, this.st.limitePorcentajeDescuento() - this.st.porcentajeDescuento() + (actual?.descuento ?? 0));
          this.st.porcentajeDescuento.update(p => p + dNuevo!.descuento);
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
        }
      } else {
        const disp = this.st.limitePorcentajeDescuento() - this.st.porcentajeDescuento();
        if (disp > 0) {
          dNuevo.descuento = Math.min(dNuevo.descuento, disp);
          this.st.porcentajeDescuento.update(p => p + dNuevo!.descuento);
          this.st.pushDescuento(dNuevo);
          this.st.descuentoImporteActual.set(dNuevo);
        }
      }
    } else if (actual && idx > -1) {
      this.st.porcentajeDescuento.update(p => p - this.st.descuentos()[idx].descuento);
      this.st.removeDescuento((_, i) => i === idx);
      this.st.descuentoImporteActual.set(null);
    }
  }

  private async _reHacerDetallesPorPrecio(): Promise<void> {
    const lp  = this.st.listaPrecio()!;
    const cli = this.st.cliente()!;
    for (let i = 0; i < this.st.ventaDetalles().length; i++) {
      const det   = this.st.ventaDetalles()[i];
      const precio = await firstValueFrom(this.precSvc.getPrecio(det.cantidad, det.producto.codProducto, lp.codListaPrecio, cli.codCliente)).catch(() => null);
      if (precio) await this._aplicarPrecioYDescuento(i, precio);
    }
  }

  private async _reHacerDetalles(): Promise<void> {
    const BONIFS = ['BONIF_PRODUCTO','BONIF_CLN-PRODUCTO','BONIF_KIT','BONIF_CLN-KIT'];
    for (let i = 0; i < this.st.ventaDetalles().length; i++) {
      const det = this.st.ventaDetalles()[i];
      if (BONIFS.includes(det.tipoDescuento)) continue;
      const sub = Math.round(det.cantidad * det.importePrecio);
      const kg  = det.cantidad * (det.producto.peso ?? 0);
      this.st.updateDetalle(i, { ...det, subTotal: sub, totalKg: kg, porcDescuento: 0, importeDescuento: 0 });
      await this._cascadaDescuento(i);
      const ext = this.st.descuentoExtraInfluencer();
      if (det.producto.sinDescuento && ext > 0) {
        const d2 = this.st.ventaDetalles()[i];
        this.st.updateDetalle(i, { ...d2, porcDescuento: ext, importeDescuento: Math.round(sub * ext / 100) });
      }
      const d3 = this.st.ventaDetalles()[i];
      this.st.updateDetalle(i, { ...d3, importeTotal: d3.subTotal - d3.importeDescuento });
      this._calcularIva(i);
      const d4 = this.st.ventaDetalles()[i];
      if (!d4.tipoDescuento) this.st.updateDetalle(i, { ...d4, tipoDescuento: 'NINGUNO' });
    }
  }

  // ══════════════════════════════════════════════════════════
  //  GUARDAR VENTA
  // ══════════════════════════════════════════════════════════
  /**
   * Punto de entrada al proceso de pago.
   * Idéntico a ng12 definirFormaPago() + definirFormaPagoVerif():
   *  1. Valida que el descuento no supere el límite (con confirmación)
   *  2. Valida venta, cliente, importe y forma de venta
   *  3. Si lista != EMPLEADOS: carga bonificaciones CLN primero, genéricas si no hay CLN
   *  4. Abre cobranza (contado) o envía directo (crédito)
   */
  async definirFormaPago(): Promise<void> {
    const v  = this.st.venta();
    const fv = this.st.formaVenta();

    // ── Validación límite de descuento (ng12: SweetAlert de confirmación) ──
    const porc   = this.st.porcentajeDescuento();
    const limite = this.st.limitePorcentajeDescuento();
    if (porc > limite) {
      const ok = confirm(
        `¿Seguro que desea cerrar la venta con descuento ${porc}% mayor al límite de ${limite}%?`
      );
      if (!ok) return;
    }

    // ── Validaciones básicas ────────────────────────────────────────────────
    if (!v || !this.st.cliente()) { this.toast.error('Venta o cliente nulo'); return; }
    if (!v.importeTotal || v.importeTotal <= 0) { this.toast.error('Venta debe ser mayor a 0'); return; }
    if (!fv) { this.toast.error('Seleccione forma de venta'); return; }

    this.st.patchVenta({ canal: this.st.canal() ?? undefined });

    // ── Bonificaciones (ng12: solo si lista != EMPLEADOS) ──────────────────
    const lp = this.st.listaPrecio();
    if (lp?.descripcion !== 'EMPLEADOS') {
      const grupos = await this._buildGrupoMaterialDetal();

      // CLN tiene prioridad — se intenta primero
      await this._loadBonificacionClnKit(grupos);
      await this._loadBonificacionClnProducto();

      // Si NO se agregó ninguna bonificación CLN, cargar las genéricas
      const tieneCln = this.st.ventaDetalles().some(
        d => d.tipoDescuento === 'BONIF_CLN-PRODUCTO' || d.tipoDescuento === 'BONIF_CLN-KIT'
      );
      if (!tieneCln) {
        await this._loadBonificacionProducto();
        await this._loadBonificacionKit(grupos);
      }
    }

    // ── Abrir cobranza o enviar directo ────────────────────────────────────
    if (fv.cantDias === 0) await this._abrirCobranza();
    else await this._pagoNoContado();
  }

  private async _abrirCobranza(): Promise<void> {
    await this.reHacerVenta();
    const [bancos, mp, tmp] = await Promise.all([
      firstValueFrom(this.bancoSvc.getAll({ codempresa: this.user.codEmpresa })).catch(() => []),
      firstValueFrom(this.mpSvc.getAll({ codempresa: this.user.codEmpresa })).catch(() => []),
      firstValueFrom(this.tmpSvc.getAll({ codempresa: this.user.codEmpresa })).catch(() => []),
    ]);
    this.st.bancos.set(bancos);
    this.st.medioPago.set(mp);
    this.st.tipoMedioPago.set(tmp);
    this.st.patchVenta({ cliente: this.st.cliente() ?? undefined, formaVenta: this.st.formaVenta() ?? undefined });
    this.st.ordenarNroItem();
    this.st.modalCobranza.set(true);
  }

  async onCobranzaGuardada(payload: { cobranzasDetalle: any[]; totalAbonado: number }): Promise<void> {
    this.st.guardando.set(true);
    const { cobranzasDetalle, totalAbonado } = payload;
    const total = Math.round(this.st.venta()!.importeTotal ?? 0);
    let pend = total;
    cobranzasDetalle.forEach(d => {
      if (pend >= d.importeAbonado) { d.importeCobrado = d.importeAbonado; pend = Math.round(pend - d.importeAbonado); }
      else { d.importeCobrado = pend; pend = 0; }
      d.saldo = Math.round(d.importeAbonado - d.importeCobrado);
    });
    // Quitar descuento grupo (no va a BD)
    const dg = this.st.descuentoGrupoActual();
    if (this.st.tieneDescuentoGrupo() && dg) this.st.removeDescuento(d => d === dg);

    const ventaDescuento = this.st.descuentos().filter(d => d.codDescuento > 0)
      .map(d => ({ codDescuento: d.codDescuento, codVenta: null, codVentaDescuento: null }));
    this.st.ventaDescuento.set(ventaDescuento as any);

    const cobranzaObj = { anulado: false, codCobranza: null as any, importeCobrado: total, importeAbonado: totalAbonado, saldo: total - totalAbonado, fechaCobranza: new Date().toISOString().slice(0, 10), detalle: cobranzasDetalle, tipo: 'VENTA' };
    this.st.patchVenta({ cobranza: cobranzaObj as any, porcDescuento: this.st.porcentajeDescuento(), detalle: this.st.ventaDetalles() as any, pedido: this.st.pedido() ?? undefined, esObsequio: this._esObsequio } as any);
    this._cerrarVenta(ventaDescuento as any);
  }

  private async _pagoNoContado(): Promise<void> {
    await this.reHacerVenta();
    const vend = this.st.vendedor();
    const ventaDescuento = this.st.descuentos().filter(d => d.codDescuento > 0)
      .map(d => ({ codDescuento: d.codDescuento, codVenta: null, codVentaDescuento: null }));
    this.st.patchVenta({ cobranza: null as any, codVendedorErp: vend?.codVendedorErp, porcDescuento: this.st.porcentajeDescuento(), detalle: this.st.ventaDetalles() as any, formaVenta: this.st.formaVenta() ?? undefined, esObsequio: this._esObsequio } as any);
    this.st.guardando.set(true);
    this._cerrarVenta(ventaDescuento as any);
  }

  private _cerrarVenta(ventaDescuento: any[]): void {
    const payload = { venta: this.st.venta(), descuentos: ventaDescuento };

    // IndexedDB guarda objetos nativos sin JSON.stringify
    // — no hay referencias circulares, no hay sanitización necesaria
    this.draft.savePending(payload, {
      detalles:            this.st.ventaDetalles(),
      descuentos:          this.st.descuentos(),
      porcentajeDescuento: this.st.porcentajeDescuento(),
      cliente:             this.st.cliente(),
      canal:               this.st.canal(),
      modoEntrega:         this.st.venta()?.modoEntrega ?? 'CONTRA_ENTREGA',
      listaPrecio:         this.st.listaPrecio(),
      formaVenta:          this.st.formaVenta(),
      vendedor:            this.st.vendedor(),
      cuponPromo:          this.st.cuponPromo(),
      pedido:              this.st.pedido(),
    });

    // Normalizar tipoDescuento: 'NiNGUNO' (typo heredado del ng12) → 'NINGUNO'
    const payloadFinal = {
      ...payload,
      venta: {
        ...payload.venta,
        detalle: (payload.venta?.detalle ?? []).map((d: any) => ({
          ...d,
          tipoDescuento: d.tipoDescuento === 'NiNGUNO' ? 'NINGUNO' : (d.tipoDescuento ?? 'NINGUNO'),
        })),
      },
    };
    this.ventaSvc.cerrarVenta(payloadFinal).subscribe({
      next: async (resp: any) => {
        this.st.guardando.set(false);
        // Éxito: eliminar tanto el pending como el draft
        this.draft.clearAll(); // async — fire-and-forget
        // ng12: invalidar cupón alianza después de venta exitosa
        const cupon = this.st.cuponPromo();
        if (cupon?.alianza) {
          const cli = this.st.cliente();
          if (cli) {
            await firstValueFrom(
              this.cuponSvc.invalidarCupon(cupon.cupon, cli.docNro ?? '', cli.razonSocial ?? '')
            // TODO: si falla la invalidación el cupón alianza queda activo en el servidor —
            // considerar reintentar o notificar al operador para invalidarlo manualmente
            ).catch(() => {});
          }
        }
        const v = resp.venta ?? resp;
        if (v.tipoComprobante === 'FACTURA') {
          this.ventaSvc.verTicketPdf(v.codVenta, '').subscribe(blob => {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          });
          this.limpiar();
        } else {
          this.router.navigate(['/ticket-venta', v.codVenta]);
        }
      },
      error: (err: any) => {
        this.st.guardando.set(false);
        // La venta quedó guardada en IDB como pending (clave: m2pos_pending_<codTerminal>)
        // El vendedor puede restaurarla con restaurarPending() y reintentar el guardado
        // El pending se borra solo cuando el servidor confirma el guardado exitoso
        if (err.status === 504) {
          this.toast.error('Timeout al guardar. Verificá en la lista de ventas antes de reintentar.', { timeOut: 8000 });
        } else if (err.status === 0) {
          this.toast.error('Sin conexión. La venta fue guardada localmente — podés reintentar.', { timeOut: 8000 });
        } else {
          this.toast.error('Error al guardar la venta. Podés reintentar.', { timeOut: 6000 });
        }
      }
    });
  }

  /**
   * Reintenta enviar el pending guardado.
   * Llamar desde el componente cuando el usuario presiona "Reintentar".
   * Retorna false si no hay pending para reintentar.
   */
  /**
   * Restaura el estado de una venta pendiente en la pantalla.
   *
   * NO reenvía automáticamente al servidor — carga los datos para que
   * el vendedor los vea, los verifique, y presione Guardar manualmente.
   * Esto evita duplicados en caso de que el servidor ya haya procesado la venta.
   *
   * Retorna false si no hay pending guardado.
   */
  async restaurarPending(): Promise<boolean> {
    const pending = await this.draft.loadPending();
    if (!pending) return false;

    const { estadoUI } = pending;

    // Restaurar cada signal desde estadoUI — datos completos y tipados correctamente
    this.st.ventaDetalles.set(estadoUI.detalles ?? []);
    this.st.descuentos.set(estadoUI.descuentos ?? []);
    this.st.porcentajeDescuento.set(estadoUI.porcentajeDescuento ?? 0);

    if (estadoUI.cliente) {
      this.st.cliente.set(estadoUI.cliente);
      this.st.razonSocial.set(estadoUI.cliente.concatDocNombre ?? estadoUI.cliente.razonSocial ?? '');
      this.st.mostrarCliente.set(true);
      this.st.buscadorHabilitado.set(true);
    }
    if (estadoUI.canal)       this.st.canal.set(estadoUI.canal);
    if (estadoUI.listaPrecio) this.st.listaPrecio.set(estadoUI.listaPrecio);
    if (estadoUI.formaVenta)  this.st.formaVenta.set(estadoUI.formaVenta);
    if (estadoUI.vendedor)    this.st.vendedor.set(estadoUI.vendedor);
    if (estadoUI.cuponPromo)  this.st.cuponPromo.set(estadoUI.cuponPromo);
    if (estadoUI.pedido)      this.st.pedido.set(estadoUI.pedido);
    if (estadoUI.modoEntrega) this.st.patchVenta({ modoEntrega: estadoUI.modoEntrega });

    // Recalcular totales para que onVerificarVenta detecte importeTotal > 0
    // y pregunte antes de borrar el carrito si el usuario selecciona otro cliente
    await this.reHacerVenta();

    // NO borrar el pending todavía — se borra solo cuando el guardado sea exitoso
    // El vendedor puede cerrar el browser de nuevo antes de guardar

    this.toast.info('Venta restaurada. Verificá los datos y presioná Guardar.', { timeOut: 6000 });
    return true;
  }

  cancelarCobranza(): void {
    this.st.modalCobranza.set(false);
    this.st.medioPago.set([]);
    this.st.tipoMedioPago.set([]);
    this.st.bancos.set([]);
    // Quitar bonificaciones agregadas antes de abrir cobranza
    this.st.spliceDetalle(d => ['BONIF_PRODUCTO','BONIF_CLN-PRODUCTO','BONIF_KIT','BONIF_CLN-KIT'].includes(d.tipoDescuento));
  }

  // ══════════════════════════════════════════════════════════
  //  PEDIDOS
  // ══════════════════════════════════════════════════════════
  async abrirModalPedidos(): Promise<void> {
    if ((this.st.venta()?.importeTotal ?? 0) > 0) { this.toast.error('Ya existe una venta en proceso'); return; }
    const hoy = new Date().toISOString().slice(0, 10);
    const r   = await firstValueFrom(this.pedSvc.findByFecha(0, hoy, hoy, null, null, 0, 20, 'PENDIENTE', false, '', 0)).catch(() => null);
    this.st.listaPedidos.set(r?.content ?? []);
    this.st.totalPedidos.set(r?.totalElements ?? 0);
    this.st.modalPedidos.set(true);
  }

  async buscarPedidos(desde: string, hasta: string, nro: number, cliente: any = null): Promise<void> {
    // ng12: acepta filtro por cliente — el servicio lo pasa como codcliente si no es null
    const r = await firstValueFrom(this.pedSvc.findByFecha(0, desde, hasta, cliente, null, 0, 20, 'PENDIENTE', false, '', nro)).catch(() => null);
    this.st.listaPedidos.set(r?.content ?? []);
    this.st.totalPedidos.set(r?.totalElements ?? 0);
  }

  /** Cargar página específica del modal pedidos — idéntico a ng12 cargarPaginaPedidos */
  async cargarPaginaPedidos(page: number, desde: string, hasta: string, cliente: any = null, nro = 0): Promise<void> {
    const r = await firstValueFrom(this.pedSvc.findByFecha(page, desde, hasta, cliente, null, 0, 20, 'PENDIENTE', false, '', nro)).catch(() => null);
    this.st.listaPedidos.set(r?.content ?? []);
    this.st.totalPedidos.set(r?.totalElements ?? 0);
  }

  async seleccionarPedido(item: any): Promise<void> {
    // ng12: confirmación antes de cargar (evita cargas accidentales)
    const ok = confirm('¿Seguro que desea cargar este pedido?');
    if (!ok) return;

    const resp = await firstValueFrom(this.pedSvc.getById(item.codPedido)).catch(() => null);
    if (!resp) return;
    const pedido = resp.pedido ?? resp;
    this.st.pedido.set(pedido);
    this.st.resetDescuentos();
    const cli = pedido.cliente as Cliente;
    this.st.cliente.set(cli);
    this.st.razonSocial.set(cli.concatDocNombre ?? '');
    this.st.mostrarCliente.set(true);
    this.st.buscadorHabilitado.set(true);
    this.st.patchVenta({ cliente: cli });
    this.st.esContado.set(cli.formaVentaPref?.esContado === true);
    await this._cargarFormaVenta(cli.formaVentaPref);
    this.st.canal.set(pedido.canal);
    this.st.patchVenta({ canal: pedido.canal, modoEntrega: pedido.modoEntrega?.toUpperCase(), pedido, cobranza: pedido.cobranza, cupon: pedido.cupon, listaPrecio: pedido.listaPrecio });
    this.st.listaPrecio.set(pedido.listaPrecio);
    this.st.porcentajeDescuento.set(pedido.porcDescuento);
    this.st.limitePorcentajeDescuento.set(this.user.maxDescuentoPorc ?? 100);
    const vend = pedido.vendedor?.tipo === 'ECOMMERCE'
      ? await firstValueFrom(this.vendSvc.getByCodUser(this.user.codUsuario)).catch(() => this.st.vendedor())
      : pedido.vendedor;
    this.st.vendedor.set(vend);
    this.st.patchVenta({ vendedor: vend, codVendedorErp: vend?.codVendedorErp });
    this.st.tipoEcommerce.set(pedido.tipoPedido !== 'POS');
    this.st.patchVenta({ tipoVenta: pedido.tipoPedido !== 'POS' ? 'ECOMMERCE' : 'POS' } as any);
    if (pedido.cobranza) this.st.cobranzaPedidoAux.set(pedido.cobranza);
    if (resp.descuentos) {
      for (const dp of resp.descuentos) {
        const d = await firstValueFrom(this.descSvc.getDescuentoById(dp.codDescuento)).catch(() => null);
        if (d) {
          if (d.tipoDescuento === 'IMPORTE')  { this.st.descuentoImporteActual.set(d); this.st.analizarDescuentoImporte.set(true); }
          if (d.tipoDescuento === 'SUCURSAL') { this.st.tieneDescuentoSucursal.set(true); this.st.descuentoSucursalActual.set(d); }
          if (d.tipoDescuento === 'CLIENTE')  { this.st.tieneDescuentoCliente.set(true);  this.st.descuentoClienteActual.set(d); }
          this.st.pushDescuento(d);
        }
      }
    }
    const detalles: VentaDetalle[] = (pedido.detalle ?? []).map((dp: any) => ({
      codVentaDetalle: null as any, nroItem: dp.nroItem, cantidad: dp.cantidad,
      importeDescuento: dp.importeDescuento, importeIva5: 0, importeIva10: 0,
      importeIvaExenta: 0, importeNeto: dp.importeNeto, importePrecio: dp.importePrecio,
      importeTotal: dp.importeTotal, subTotal: dp.subTotal, totalKg: dp.totalKg,
      porcDescuento: dp.porcDescuento, porcIva: dp.porcIva, producto: dp.producto,
      unidadMedida: dp.unidadMedida, venta: null, codVendedorErp: vend?.codVendedorErp ?? '',
      vendedor: vend, tipoDescuento: dp.tipoDescuento,
    }));
    this.st.ventaDetalles.set(detalles);
    // Recalcular IVA y totales desde los detalles del pedido
    // (los campos importeIva5/10/exenta se zeraron al mapear — reHacerVenta los recalcula)
    await this.reHacerVenta();
    this.st.modalPedidos.set(false);
    this.toast.success('Pedido cargado exitosamente');
  }

  // ══════════════════════════════════════════════════════════
  //  FORMA VENTA / CANAL
  // ══════════════════════════════════════════════════════════
  async cargarFormaVenta(formaPref: FormaVenta): Promise<void> { await this._cargarFormaVenta(formaPref); }

  setCanalByCod(cod: number): void {
    const c = this.st.canales().find(x => x.codCanal == cod) ?? null;
    if (c) { this.st.canal.set(c); this.st.patchVenta({ canal: c }); }
  }

  cambioForma(cod: number): void {
    const f = this.st.formas().find(x => x.codFormaVenta == cod) ?? null;
    if (f) { this.st.formaVenta.set(f); this.st.selFormaVentaCod.set(f.codFormaVenta); this.st.esContado.set(f.cantDias === 0); }
  }

  // ══════════════════════════════════════════════════════════
  //  CUPONES
  // ══════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════
  //  CUPONES — validación idéntica a ng12
  // ══════════════════════════════════════════════════════════

  /**
   * Valida el código de cupón.
   * Idéntico a ng12 validarCupon():
   *   - Busca por código
   *   - Verifica activo, fechaVencimiento, cliente no predeterminado/propietario/lista2
   * Retorna objeto con { alerta, cupon } para que el componente muestre el estado.
   */
  async validarCupon(codigoCupon: string): Promise<{ alerta: string; cuponPromo: any | null }> {
    const cli = this.st.cliente()!;
    let alerta = '';
    let cuponPromo: any = null;

    const cupon = await firstValueFrom(
      this.cuponSvc.getByCupon(this.user.codEmpresa, codigoCupon)
    ).catch(() => null);

    if (!cupon) {
      return { alerta: 'Código de cupón no válido', cuponPromo: null };
    }
    if (cupon.activo === false) {
      alerta = `El cupón fue utilizado por ${cupon.nroDocUs} ${cupon.razonSocialUs}`;
    }
    const hoy = new Date().toISOString().slice(0, 10);
    const venc = new Date(cupon.fechaVencimiento).toISOString().slice(0, 10);
    if (venc < hoy) {
      alerta = 'El cupón está vencido';
    }
    if (cli.predeterminado || (cli as any).esPropietario || cli.listaPrecio?.codListaPrecio === 2) {
      alerta = 'No se puede aplicar cupón a funcionario o cliente mostrador';
    }
    if (!alerta) {
      alerta = 'Cupón válido';
      cuponPromo = { cupon: cupon.cupon, descuento: cupon.descuento, alianza: !!cupon.alianza };
    }
    return { alerta, cuponPromo };
  }

  /**
   * Valida el código de cupón influencer.
   * Idéntico a ng12 validarInFluencerCupon():
   *   - Busca el descuento por código y cliente
   *   - Verifica cantValidez > 0 e influencer existente
   *   - Bloquea para cliente predeterminado/propietario/lista2
   */
  async validarInfluencer(codigoCupon: string): Promise<{ alerta: string; cuponPromo: any | null }> {
    const cli = this.st.cliente()!;

    const resp = await firstValueFrom(
      this.influSvc.obtenerDescuento(this.user.codEmpresa, codigoCupon.toUpperCase(), cli.codCliente)
    ).catch(() => null);

    const influencer = resp?.influencer ?? null;

    if (!resp || resp.cantValidez === 0 || !influencer) {
      return { alerta: 'Código de cupón no es válido', cuponPromo: null };
    }
    if (cli.predeterminado || (cli as any).esPropietario || cli.listaPrecio?.codListaPrecio === 2) {
      return { alerta: 'No se puede aplicar cupón a funcionario o cliente mostrador', cuponPromo: null };
    }
    return {
      alerta: 'Código de influencer válido',
      cuponPromo: { cupon: influencer.cupon, descuento: influencer.descuento, influencer: true },
    };
  }

  async usarCupon(cupon: { cupon: string; descuento: number; alianza?: boolean }): Promise<void> {
    this.st.descuentos.set([]);
    const d: Descuento = { codDescuento: 0, descripcion: cupon.cupon, tipoDescuento: 'CUPON', unidadDescuento: 'PORCENTAJE', descuento: cupon.descuento, listaPrecio: this.st.listaPrecio()!, producto: null as any, cliente: null as any, medioPago: null as any, cantDesde: 0, cantHasta: 99999999, activo: true, codDescuentoErp: '', codEmpresa: this.user.codEmpresa, codSucursal: this.user.codSucursal, fechaDesde: new Date(), fechaHasta: new Date() };
    this.st.pushDescuento(d);
    this.st.cuponPromo.set(cupon);
    this.st.patchVenta({ cupon: cupon.cupon } as any);
    this.st.porcentajeDescuento.set(cupon.descuento);
    this.st.tieneDescuentoGrupo.set(false);
    this.st.tieneDescuentoSucursal.set(false);
    this.st.tieneDescuentoCliente.set(true);
    this.st.tieneDescuentoClienteFull.set(true);
    this.st.modalCupon.set(false);
    if (this.st.ventaDetalles().length > 0) await this.reHacerVenta();
  }

  async usarInfluencerCupon(cupon: { cupon: string; descuento: number }): Promise<void> {
    this.st.cuponPromo.set({ ...cupon, influencer: true });
    this.st.patchVenta({ cupon: cupon.cupon } as any);
    this.st.descuentoExtraInfluencer.set(cupon.descuento);
    this.st.modalInfluencer.set(false);
    if (this.st.ventaDetalles().length > 0) await this.reHacerVenta();
  }

  // ══════════════════════════════════════════════════════════
  //  LIMPIAR
  // ══════════════════════════════════════════════════════════
  limpiar(): void {
    // Limpiar draft y pending al cancelar o después de guardar exitosamente
    this.draft.clearAll(); // async — fire-and-forget
    const dep = this.st.deposito();
    if (dep && this.st.ventaDetalles().length > 0)
      this.stockSvc.cancelarComprometido(dep.codDeposito, this.st.ventaDetalles()).subscribe();
    this.st.resetCarrito();
    this.st.modalCobranza.set(false);
    this.st.modalCupon.set(false);
    this.st.guardando.set(false);
    this.st.tipoEcommerce.set(false);
    this._initVenta();
    // ng12: limpiar → ngOnInit → cargar() → vuelve al cliente predeterminado
    // ng20: restaurar cliente predeterminado sin recargar todo el estado
    this._restaurarClientePredeterminado();
  }

  /**
   * Restaura el cliente predeterminado (mostrador) después de guardar una venta.
   * Idéntico al efecto de ng12 limpiar() → ngOnInit() → cargar() en cuanto al cliente.
   */
  private _restaurarClientePredeterminado(): void {
    firstValueFrom(this.cliSvc.getClienteDefault()).then(async cliDef => {
      if (!cliDef) return;
      await this._setCliente(cliDef);
      await this._cargarFormaVenta(cliDef.formaVentaPref);
      this.st.descuentos.set([]);
      this.st.porcentajeDescuento.set(0);
      this.st.limitePorcentajeDescuento.set(this.user.maxDescuentoPorc ?? 100);
      await this._buscarDescuentos();
      this.st.mostrarCliente.set(true);
      this.st.buscadorHabilitado.set(true);
      this.cargarProductos(0, '', 0);
    }).catch(() => null);
  }

  cancelarStockAlSalir(): void {
    const dep = this.st.deposito();
    if (dep && this.st.ventaDetalles().length > 0)
      this.stockSvc.cancelarComprometido(dep.codDeposito, this.st.ventaDetalles()).subscribe();
  }

  // ══════════════════════════════════════════════════════════
  //  PRIVADOS
  // ══════════════════════════════════════════════════════════

  /**
   * Guarda un snapshot del carrito en IndexedDB.
   * Se llama automáticamente tras cada mutación del carrito.
   */
  /**
   * Guarda snapshot completo del estado de la venta.
   * IndexedDB guarda objetos JS nativos — no hay JSON.stringify,
   * no hay problema con referencias circulares.
   * Se llama tras cada mutación del carrito.
   */
  private _autosaveDraft(): void {
    this.draft.saveDraft({
      detalles:            this.st.ventaDetalles(),
      descuentos:          this.st.descuentos(),
      porcentajeDescuento: this.st.porcentajeDescuento(),
      cliente:             this.st.cliente(),
      canal:               this.st.canal(),
      modoEntrega:         this.st.venta()?.modoEntrega ?? 'CONTRA_ENTREGA',
      listaPrecio:         this.st.listaPrecio(),
      formaVenta:          this.st.formaVenta(),
      vendedor:            this.st.vendedor(),
      cuponPromo:          this.st.cuponPromo(),
      pedido:              this.st.pedido(),
    });
  }

  async hasDraft():   Promise<boolean> { return this.draft.hasDraft(); }
  async hasPending(): Promise<boolean> { return this.draft.hasPending(); }

  private _esObsequio = false;
  setEsObsequio(v: boolean): void { this._esObsequio = v; }

  private async _setCliente(cli: Cliente): Promise<void> {
    this.st.cliente.set(cli);
    this.st.listaPrecio.set(cli.listaPrecio);
    this.st.razonSocial.set(cli.concatDocNombre ?? '');
    this.st.esContado.set(cli.formaVentaPref?.esContado === true);
    this.st.patchVenta({ cliente: cli, listaPrecio: cli.listaPrecio });
  }

  private async _cargarFormaVenta(formaPref: FormaVenta): Promise<void> {
    const r = await firstValueFrom(this.fvSvc.getAll({ codempresa: this.user.codEmpresa })).catch(() => []);
    const formas: FormaVenta[] = Array.isArray(r) ? r : [];
    this.st.formas.set(formas);
    const found = formas.find(f => f.codFormaVenta === formaPref?.codFormaVenta) ?? formaPref;
    this.st.formaVenta.set(found ?? null);
    this.st.selFormaVentaCod.set(found?.codFormaVenta ?? null);
    this.st.esContado.set(found?.esContado === true || found?.cantDias === 0);
  }

  // ══════════════════════════════════════════════════════════
  //  BONIFICACIONES — idéntico a ng12 definirFormaPagoVerif()
  //  Se ejecuta solo si listaPrecio.descripcion != 'EMPLEADOS'
  //  Orden: CLN-KIT → CLN-PRODUCTO → si no hay CLN → KIT → PRODUCTO
  // ══════════════════════════════════════════════════════════

  /**
   * Agrupa los detalles del carrito por grpMaterial acumulando cantidades.
   * Los ítems sin grpMaterial se ignoran (igual que ng12).
   */
  private async _buildGrupoMaterialDetal(): Promise<{ grpMaterial: string; cantidad: number }[]> {
    const grupos: { grpMaterial: string; cantidad: number }[] = [];
    for (const det of this.st.ventaDetalles()) {
      if (!det.producto.grpMaterial) {
        continue;
      }
      const idx = grupos.findIndex(g => g.grpMaterial === det.producto.grpMaterial);
      if (idx === -1) {
        grupos.push({ grpMaterial: det.producto.grpMaterial, cantidad: det.cantidad });
      } else {
        grupos[idx].cantidad += det.cantidad;
      }
    }
    return grupos;
  }

  /**
   * Carga bonificaciones por PRODUCTO (sin cliente específico).
   * Recorre cada detalle del carrito y agrega el producto bonificado si existe.
   */
  private async _loadBonificacionProducto(): Promise<void> {
    const lp  = this.st.listaPrecio()!;
    const cli = this.st.cliente()!;
    const vend = this.st.vendedor()!;
    // Snapshot del carrito actual — iterar sobre copia para no mutar mientras recorremos
    const detalles = [...this.st.ventaDetalles()];
    for (const det of detalles) {
      const bonif = await firstValueFrom(
        this.bonifSvc.getBonificacionProducto(det.cantidad, lp.codListaPrecio, det.producto.codProducto)
      ).catch(() => null);
      if (!bonif) continue;
      const precio = await firstValueFrom(
        this.precSvc.getPrecio(bonif.cantBonif, bonif.materialBonif.codProducto, lp.codListaPrecio, cli.codCliente)
      ).catch(() => null);
      if (!precio) continue;
      this.st.pushDetalle({
        codVentaDetalle: null as any, nroItem: this.st.ventaDetalles().length + 1,
        cantidad: bonif.cantBonif, importeDescuento: 0, importeIva5: 0, importeIva10: 0,
        importeIvaExenta: 0, importeNeto: 0, importePrecio: precio.precio, importeTotal: 0,
        subTotal: 0, totalKg: 0, porcDescuento: 0, porcIva: 0,
        producto: bonif.materialBonif, unidadMedida: precio.unidadMedida,
        venta: null as any, vendedor: vend, codVendedorErp: vend.codVendedorErp,
        tipoDescuento: 'BONIF_PRODUCTO',
      });
    }
  }

  /**
   * Carga bonificaciones por PRODUCTO específico del CLIENTE (CLN-PRODUCTO).
   * Tiene prioridad sobre BONIF_PRODUCTO — si hay CLN no se carga la genérica.
   */
  private async _loadBonificacionClnProducto(): Promise<void> {
    const lp  = this.st.listaPrecio()!;
    const cli = this.st.cliente()!;
    const vend = this.st.vendedor()!;
    const detalles = [...this.st.ventaDetalles()];
    for (const det of detalles) {
      const bonif = await firstValueFrom(
        this.bonifSvc.getBonificacionClnProducto(det.cantidad, lp.codListaPrecio, det.producto.codProducto, cli.codCliente)
      ).catch(() => null);
      if (!bonif) continue;
      const precio = await firstValueFrom(
        this.precSvc.getPrecio(bonif.cantBonif, bonif.materialBonif.codProducto, lp.codListaPrecio, cli.codCliente)
      ).catch(() => null);
      if (!precio) continue;
      this.st.pushDetalle({
        codVentaDetalle: null as any, nroItem: this.st.ventaDetalles().length + 1,
        cantidad: bonif.cantBonif, importeDescuento: 0, importeIva5: 0, importeIva10: 0,
        importeIvaExenta: 0, importeNeto: 0, importePrecio: precio.precio, importeTotal: 0,
        subTotal: 0, totalKg: 0, porcDescuento: 0, porcIva: 0,
        producto: bonif.materialBonif, unidadMedida: precio.unidadMedida,
        venta: null as any, vendedor: vend, codVendedorErp: vend.codVendedorErp,
        tipoDescuento: 'BONIF_CLN-PRODUCTO',
      });
    }
  }

  /**
   * Carga bonificaciones por KIT (grupo de materiales, sin cliente específico).
   */
  private async _loadBonificacionKit(grupos: { grpMaterial: string; cantidad: number }[]): Promise<void> {
    const lp  = this.st.listaPrecio()!;
    const cli = this.st.cliente()!;
    const vend = this.st.vendedor()!;
    for (const grp of grupos) {
      const bonif = await firstValueFrom(
        this.bonifSvc.getBonificacionKit(grp.cantidad, lp.codListaPrecio, grp.grpMaterial)
      ).catch(() => null);
      if (!bonif) continue;
      const precio = await firstValueFrom(
        this.precSvc.getPrecio(bonif.cantBonif, bonif.materialBonif.codProducto, lp.codListaPrecio, cli.codCliente)
      ).catch(() => null);
      if (!precio) continue;
      this.st.pushDetalle({
        codVentaDetalle: null as any, nroItem: this.st.ventaDetalles().length + 1,
        cantidad: bonif.cantBonif, importeDescuento: 0, importeIva5: 0, importeIva10: 0,
        importeIvaExenta: 0, importeNeto: 0, importePrecio: precio.precio, importeTotal: 0,
        subTotal: 0, totalKg: 0, porcDescuento: 0, porcIva: 0,
        producto: bonif.materialBonif, unidadMedida: precio.unidadMedida,
        venta: null as any, vendedor: vend, codVendedorErp: vend.codVendedorErp,
        tipoDescuento: 'BONIF_KIT',
      });
    }
  }

  /**
   * Carga bonificaciones por KIT específico del CLIENTE (CLN-KIT).
   * Tiene prioridad — si hay CLN-KIT o CLN-PRODUCTO no se cargan las genéricas.
   */
  private async _loadBonificacionClnKit(grupos: { grpMaterial: string; cantidad: number }[]): Promise<void> {
    const lp  = this.st.listaPrecio()!;
    const cli = this.st.cliente()!;
    const vend = this.st.vendedor()!;
    for (const grp of grupos) {
      const bonif = await firstValueFrom(
        this.bonifSvc.getBonificacionClnKit(grp.cantidad, lp.codListaPrecio, grp.grpMaterial, cli.codCliente)
      ).catch(() => null);
      if (!bonif) continue;
      const precio = await firstValueFrom(
        this.precSvc.getPrecio(bonif.cantBonif, bonif.materialBonif.codProducto, lp.codListaPrecio, cli.codCliente)
      ).catch(() => null);
      if (!precio) continue;
      this.st.pushDetalle({
        codVentaDetalle: null as any, nroItem: this.st.ventaDetalles().length + 1,
        cantidad: bonif.cantBonif, importeDescuento: 0, importeIva5: 0, importeIva10: 0,
        importeIvaExenta: 0, importeNeto: 0, importePrecio: precio.precio, importeTotal: 0,
        subTotal: 0, totalKg: 0, porcDescuento: 0, porcIva: 0,
        producto: bonif.materialBonif, unidadMedida: precio.unidadMedida,
        venta: null as any, vendedor: vend, codVendedorErp: vend.codVendedorErp,
        tipoDescuento: 'BONIF_CLN-KIT',
      });
    }
  }

  private async _buscarDescuentos(): Promise<void> {
    const cli = this.st.cliente()!;
    const lp  = this.st.listaPrecio()!;
    // Si no tiene grupoDescuento: solo avisar, NO redirigir
    // (redirigir destruye el componente y pierde los detalles del IDB)
    if (!cli.grupoDescuento) {
      // Cliente sin grupoDescuento — no se aplican descuentos de grupo
      // Verificar que el cliente tenga grupoDescuento asignado en el ERP
      return;
    }

    const auxFull = await firstValueFrom(this.descSvc.getDescuento('CLIENTE_FULL', cli.codCliente, 1, lp.codListaPrecio)).catch(() => null);
    if (auxFull && auxFull.comprasDisponibles > 0) {
      this.st.descuentoClienteActual.set(auxFull);
      this.st.porcentajeDescuento.update(p => p + auxFull.descuento);
      this.st.tieneDescuentoCliente.set(true);
      this.st.tieneDescuentoClienteFull.set(true);
      this.st.pushDescuento(auxFull);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (cli.grupoDescuento.descuento > 0 && (cli.carnetVencimiento ?? '') >= today) {
      const dSuc    = await firstValueFrom(this.descSvc.getDescuento('SUCURSAL', 1, 1, lp.codListaPrecio)).catch(() => null);
      const descGrupo: Descuento = { codDescuento: 0, descripcion: cli.grupoDescuento.descripcion, tipoDescuento: 'Grupo cliente', unidadDescuento: 'PORCENTAJE', descuento: cli.grupoDescuento.descuento + (dSuc ? 10 : 0), listaPrecio: lp, producto: null as any, cliente: null as any, medioPago: null as any, cantDesde: 0, cantHasta: 99999999, activo: true, codDescuentoErp: '', codEmpresa: this.user.codEmpresa, codSucursal: this.user.codSucursal, fechaDesde: new Date(), fechaHasta: new Date() };
      this.st.descuentoGrupoActual.set(descGrupo);
      this.st.porcentajeDescuento.update(p => p + descGrupo.descuento);
      this.st.tieneDescuentoGrupo.set(true);
      this.st.tieneDescuentoSucursal.set(false);
      this.st.tieneDescuentoCliente.set(false);
      this.st.pushDescuento(descGrupo);
      return;
    }
    const dSuc = await firstValueFrom(this.descSvc.getDescuento('SUCURSAL', 1, 1, lp.codListaPrecio)).catch(() => null);
    if (dSuc) { this.st.descuentoSucursalActual.set(dSuc); this.st.porcentajeDescuento.update(p => p + dSuc.descuento); this.st.tieneDescuentoSucursal.set(true); this.st.pushDescuento(dSuc); return; }
    const dCli = await firstValueFrom(this.descSvc.getDescuento('CLIENTE', cli.codCliente, 1, lp.codListaPrecio)).catch(() => null);
    if (dCli) { this.st.descuentoClienteActual.set(dCli); this.st.porcentajeDescuento.update(p => p + dCli.descuento); this.st.tieneDescuentoCliente.set(true); this.st.pushDescuento(dCli); }
  }

  private _initVenta(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.st.venta.set({ codVenta: null as any, anulado: false, codEmpresaErp: this.user.codEmpresaErp, codSucursalErp: this.user.codSucursalErp, codEmpresa: this.user.codEmpresa, codSucursal: this.user.codSucursal, estado: 'TEMP', modoEntrega: 'CONTRA_ENTREGA', fechaAnulacion: null as any, fechaCreacion: null as any, fechaVencimiento: null as any, fechaVenta: today, fechaModificacion: null as any, porcDescuento: 0, importeDescuento: 0, importeIva5: 0, importeIva10: 0, importeIvaExenta: 0, importeNeto: 0, importeTotal: 0, descuentoProducto: 0 as any, subTotal: 0, totalKg: 0 as any, timbrado: '', inicioTimbrado: '', finTimbrado: '', codUsuarioAnulacion: null as any, nroComprobante: '', tipoComprobante: '', terminalVenta: this.st.terminal() ?? undefined, deposito: this.st.deposito() ?? undefined, cobranza: null as any, codUsuarioCreacion: this.user.codUsuario, cliente: this.st.cliente() ?? undefined, pedido: null as any, formaVenta: this.st.formaVenta() ?? undefined, detalle: null as any, motivoAnulacion: null as any, esObsequio: this._esObsequio, editable: false, codVendedorErp: this.st.vendedor()?.codVendedorErp ?? '', listaPrecio: this.st.listaPrecio() ?? undefined, vendedor: this.st.vendedor() ?? undefined, tipoVenta: 'POS', canal: this.st.canal() ?? undefined, cupon: null as any });
  }

  private _uuid(): string { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }
}