/**
 * ObsequiosFacadeService — lógica de negocio para la página de obsequios
 * ────────────────────────────────────────────────────────────────────────
 * Diferencias clave con VentasFacadeService:
 *
 *   - Cliente: PROPIETARIO fijo (clientes/propietario), sin buscador
 *   - Precio:  precio COSTO (precioMaterial/precioCosto), no precio de venta
 *   - Sin descuentos, sin cupones, sin bonificaciones, sin influencers
 *   - Sin cambio de cliente — la pantalla no tiene buscador
 *   - Guardar: pagoNoContado() directo, cobranza = null
 *   - IVA: se calcula desde el precio costo, misma lógica que ventas
 */
import { Injectable, inject }   from '@angular/core';
import { Router }                from '@angular/router';
import { firstValueFrom }        from 'rxjs';

import { AuthService }           from '../../core/services/auth.service';
import { ClienteService }        from '../../core/services/domain/cliente.service';
import { ProductoService }       from '../../core/services/domain/producto.service';
import { PrecioMaterialService } from '../../core/services/domain/precio-material.service';
import { PrecioService }         from '../../core/services/domain/precio.service';
import { StockService }          from '../../core/services/domain/stock.service';
import { VentasService }         from '../../core/services/domain/ventas.service';
import { CategoriaService }      from '../../core/services/domain/categoria.service';
import { DepositoService }       from '../../core/services/domain/deposito.service';
import { ComprobantesService }   from '../../core/services/domain/comprobantes.service';
import { VendedorService }       from '../../core/services/domain/vendedor.service';
import { CanalService }          from '../../core/services/domain/canal.service';
import { TerminalesService }     from '../../core/services/domain/terminales.service';
import { ToastService }          from '../../shared/components/toast/toast.service';

import { VentasStateService }    from './ventas-state.service';
import { VentaDetalle }          from '../../core/models/domain/venta-detalle.model';

@Injectable()
export class ObsequiosFacadeService {

  private readonly auth      = inject(AuthService);
  private readonly router    = inject(Router);
  private readonly toast     = inject(ToastService);

  // Servicios de dominio
  private readonly cliSvc    = inject(ClienteService);
  private readonly prodSvc   = inject(ProductoService);
  private readonly pmSvc     = inject(PrecioMaterialService);
  private readonly precSvc   = inject(PrecioService);
  private readonly stockSvc  = inject(StockService);
  private readonly ventaSvc  = inject(VentasService);
  private readonly catSvc    = inject(CategoriaService);
  private readonly depSvc    = inject(DepositoService);
  private readonly compSvc   = inject(ComprobantesService);
  private readonly vendSvc   = inject(VendedorService);
  private readonly canalSvc  = inject(CanalService);
  private readonly termSvc   = inject(TerminalesService);

  readonly st = inject(VentasStateService);

  private get user() {return this.auth.session!;  }

  // ── Inicialización ──────────────────────────────────────────────────────────

  async initTerminal(): Promise<void> {
    const tv = this.auth.terminal;
    if (tv?.codTerminalVenta > 0) {
      const ok = await firstValueFrom(this.termSvc.getById(tv.codTerminalVenta)).catch(() => null);
      if (ok) {
        // Regenerar UUID en cada apertura — el ng12 siempre generaba UUID nuevo
        // Un UUID viejo guardado en auth puede estar expirado en el servidor → 500
        const tvFresh = { ...tv, id: crypto.randomUUID() };
        this.auth.saveTerminal(tvFresh);
        this.st.terminal.set(tvFresh);
        this.st.autorizado.set(true);
        await this.cargar();
        return;
      }
    }
    const r = await firstValueFrom(this.termSvc.traerterminalesDisponibles(this.user.codEmpresa, 0)).catch(() => []);
    const list = Array.isArray(r) ? r : (r as any)?.content ?? [];
    this.st.terminales.set(list);
    const t = list[0] ?? null;
    if (t) this.st.terminal.set(t);
  }

  async guardarTerminal(codTerminal: number): Promise<void> {
    const list = this.st.terminales();
    const t    = list.find((x: any) => x.codTerminalVenta == codTerminal);
    if (!t) return;
    await firstValueFrom(this.auth.changeSucursal(t.codSucursal)).catch(() => null);
    this.auth.saveTerminal({ ...t, id: crypto.randomUUID() });
    this.st.terminal.set(t);
    this.st.autorizado.set(true);
    await this.cargar();
  }

  /**
   * Carga inicial: cliente propietario (distinto a ventas que usa predeterminado),
   * depósito, categorías, comprobante, vendedor y canal.
   */
  async cargar(): Promise<void> {
    const codEmp = this.user.codEmpresa;
    const codSuc = this.user.codSucursal;
    const term   = this.st.terminal();

    const [comp, dep, catsRaw, canalesRaw, vend, clienteProp] = await Promise.all([
      firstValueFrom(this.compSvc.getComprobanteByTerminalId(term!.codTerminalVenta)).catch(() => null),
      firstValueFrom(this.depSvc.getDepositoVenta(codEmp, codSuc)).catch(() => null),
      firstValueFrom(this.catSvc.getAll({ codempresa: codEmp })).catch(() => null),
      firstValueFrom(this.canalSvc.getAll({ codempresa: codEmp })).catch(() => []),
      firstValueFrom(this.vendSvc.getByCodUser(this.user.codUsuario)).catch(() => null),
      // ← PROPIETARIO, no predeterminado
      firstValueFrom(this.cliSvc.getClientePropietario()).catch(() => null),
    ]);

    if (!dep)         { this.toast.error('Sucursal sin depósito de ventas'); return; }
    if (!clienteProp) { this.toast.error('No existe cliente propietario'); return; }

    this.st.comprobante.set(comp);
    this.st.deposito.set(dep);
    this.st.vendedor.set(vend);

    const cats  = Array.isArray(catsRaw) ? catsRaw : (catsRaw ?? []);
    const todos = { codCategoriaProducto: 0, descripcion: 'Todos', codCategoriaProductoErp: '99', codEmpresa: codEmp };
    this.st.categorias.set([todos, ...cats]);

    const canales = Array.isArray(canalesRaw) ? canalesRaw : [];
    this.st.canales.set(canales);

    // Setear cliente propietario — sin descuentos, sin buscador
    this.st.cliente.set(clienteProp);
    this.st.razonSocial.set(clienteProp.concatDocNombre ?? '');
    this.st.listaPrecio.set(clienteProp.listaPrecio);
    this.st.mostrarCliente.set(true);
    this.st.buscadorHabilitado.set(true);

    // Canal principal — debe estar seteado ANTES de _initVenta para que
    // el canal aparezca en el payload (el viejo ng12 siempre lo tenía)
    const cp = await firstValueFrom(this.canalSvc.getCanalPrincipal()).catch(() => null);
    const canalActivo = cp ?? canales[0] ?? null;
    this.st.canal.set(canalActivo);

    this._initVenta();
    this.st.patchVenta({
      canal:    canalActivo   ?? undefined,
      deposito: dep,
      // formaVenta desde el cliente propietario
      formaVenta: clienteProp.formaVentaPref ?? undefined,
    });

    this.cargarProductos(0, '', 0);
  }

  // ── Productos ───────────────────────────────────────────────────────────────

  cargarProductos(page: number, termino: string, codCategoria: number): void {
    this.st.cargandoProds.set(true);
    const params: Record<string, any> = {
      codempresa: this.user.codEmpresa, page, size: 14, activo: true
    };
    if (termino)       params['keyword']            = termino.toUpperCase();
    if (codCategoria)  params['codCategoriaProducto'] = codCategoria;

    this.prodSvc.getAll(params).subscribe({
      next: (r: any) => {
        const items = Array.isArray(r) ? r : (r?.content ?? []);
        const total = r?.totalElements ?? items.length;
        this.st.productos.set(items);
        this.st.totalElementos.set(total);
        this.st.cargandoProds.set(false);
      },
      error: () => this.st.cargandoProds.set(false),
    });
  }

  /**
   * Agrega un producto usando PRECIO COSTO (precioMaterial/precioCosto),
   * sin descuentos de ningún tipo.
   */
  async seleccionarProducto(producto: any, cantidad: number): Promise<void> {
    if (cantidad <= 0) { this.toast.error('Cantidad debe ser mayor a 0'); return; }

    const dep  = this.st.deposito();
    const comp = this.st.comprobante();
    const vend = this.st.vendedor()!;

    // Límite de ítems por comprobante
    if (comp && comp.maxItems <= this.st.ventaDetalles().length) {
      this.toast.error('Límite de ítems por comprobante alcanzado');
      return;
    }

    // Stock
    if (producto.inventariable) {
      const stock = await firstValueFrom(
        this.stockSvc.traerStock(dep!.codDeposito, producto.codProducto)
      ).catch(() => null);
      if (!stock) { this.toast.error('Producto inventariable sin stock'); return; }
      const disponible = stock.existencia - stock.comprometido;
      if (cantidad > disponible) { this.toast.error('Sin stock disponible'); return; }
      this.stockSvc.update({ ...stock, comprometido: stock.comprometido + cantidad }).subscribe();
    }

    // Precio costo — endpoint: precioMaterial/precioCosto?codproductoerp=X&codsucursalerp=Y
    const pm = await firstValueFrom(
      this.pmSvc.findByPrecioCostoActual(producto.codProductoErp, this.user.codSucursalErp)
    ).catch(() => null);

    if (!pm) { this.toast.error('El producto no tiene precio costo'); return; }

    // Obtener unidadMedida via PrecioService — igual que ng12 buscarUnidadMedida()
    // PrecioMaterial no tiene unidadMedida; el servicio de precio sí la devuelve
    const precioConUnidad: any = await firstValueFrom(
      this.precSvc.getPrecio(1, producto.codProducto, this.st.listaPrecio()!.codListaPrecio, this.st.cliente()!.codCliente)
    ).catch(() => null);
    const unidadMedida = precioConUnidad?.unidadMedida ?? producto.unidad ?? null;

    // Calcular IVA — idéntico a ng12 obsequios
    const iva       = producto.iva ?? 0;
    const subTotal  = Math.round(pm.precioCosto * cantidad);
    const ivaImporte = Math.round((subTotal * 10) / 100); // ng12 usaba 10% fijo
    let importeTotal = Math.round(subTotal + ivaImporte);
    let importeIva5  = 0, importeIva10 = 0, importeIvaExenta = 0, importeNeto = 0;

    switch (iva) {
      case 0:
        importeIvaExenta = importeTotal;
        importeNeto      = importeTotal;
        break;
      case 5:
        importeIva5  = Math.round(importeTotal / 21);
        importeNeto  = importeTotal - importeIva5;
        break;
      case 10:
        if (producto.ivaEspecial) {
          importeIvaExenta = Math.round(importeTotal / 2.1);
          const gravada    = Math.round(importeIvaExenta * 1.1);
          importeIva10     = Math.round(gravada / 11);
          importeNeto      = importeTotal - importeIva10;
        } else {
          importeIva10 = Math.round(importeTotal / 11);
          importeNeto  = importeTotal - importeIva10;
        }
        break;
    }

    // Buscar si ya existe en el carrito — sumar cantidad
    const detalles = this.st.ventaDetalles();
    const idx      = detalles.findIndex((d: any) => d.producto.codProducto === producto.codProducto);

    if (idx >= 0) {
      // Actualizar existente
      const det     = detalles[idx];
      const newCant = det.cantidad + cantidad;
      const newSub  = Math.round(pm.precioCosto * newCant);
      const newIvaI = Math.round((newSub * 10) / 100);
      const newTotal = Math.round(newSub + newIvaI);
      this.st.updateDetalle(idx, {
        ...det, cantidad: newCant, subTotal: newSub, importeTotal: newTotal,
        importeIva5: iva === 5 ? Math.round(newTotal / 21) : 0,
        importeIva10: iva === 10 ? Math.round(newTotal / 11) : 0,
        importeIvaExenta: iva === 0 ? newTotal : 0,
        importeNeto: newTotal - (iva === 5 ? Math.round(newTotal / 21) : iva === 10 ? Math.round(newTotal / 11) : 0),
        totalKg: newCant * (producto.peso ?? 0),
        unidadMedida: unidadMedida ?? det.unidadMedida,
      });
    } else {
      // Nuevo ítem
      this.st.pushDetalle({
        codVentaDetalle: null as any,
        nroItem:         detalles.length + 1,
        cantidad,
        importePrecio:   pm.precioCosto,
        subTotal,
        importeTotal,
        importeDescuento: 0,
        porcDescuento:    0,
        importeIva5,
        importeIva10,
        importeIvaExenta,
        importeNeto,
        totalKg:         cantidad * (producto.peso ?? 0),
        porcIva:         iva,
        tipoDescuento:   'NINGUNO',
        producto,
        unidadMedida:    unidadMedida,
        venta:           null as any,
        vendedor:        vend,
        codVendedorErp:  vend.codVendedorErp,
      });
    }

    this._calcularTotal();
    this.toast.success(producto.nombreProducto, { title: 'Producto agregado' });
  }

  async restarProducto(item: VentaDetalle): Promise<void> {
    if (item.cantidad <= 1) return;
    const idx = this.st.ventaDetalles().findIndex(d => d === item);
    if (idx < 0) return;
    this.st.updateDetalle(idx, { ...item, cantidad: item.cantidad - 1 });
    this._calcularTotal();
  }

  async quitarProductoCompleto(item: VentaDetalle): Promise<void> {
    if (item.producto.inventariable) {
      const stock = await firstValueFrom(
        this.stockSvc.traerStock(this.st.deposito()!.codDeposito, item.producto.codProducto)
      ).catch(() => null);
      if (stock) this.stockSvc.update({ ...stock, comprometido: Math.max(0, stock.comprometido - item.cantidad) }).subscribe();
    }
    const idx = this.st.ventaDetalles().findIndex(d => d === item);
    if (idx >= 0) this.st.removeDetalle(idx);
    this.st.ordenarNroItem();
    this._calcularTotal();
  }

  // ── Guardar ─────────────────────────────────────────────────────────────────

  /**
   * Valida y guarda el obsequio.
   * Sin cobranza (cobranza = null), pago no contado directo.
   * Idéntico a ng12 validarPorcentaje → cerrarObsequio → pagoNoContado.
   */
  async guardarObsequio(): Promise<void> {
    const v  = this.st.venta();
    const fv = this.st.formaVenta();
    const cli = this.st.cliente();

    if (!v || !cli)                          { this.toast.error('Venta o cliente nulo'); return; }
    if (!v.importeTotal || v.importeTotal <= 0) { this.toast.error('Venta debe ser mayor a 0'); return; }

    // Confirmación antes de guardar — idéntico a ng12 cerrarObsequio
    const ok = confirm('¿Seguro que desea cerrar el obsequio?');
    if (!ok) return;

    this.st.guardando.set(true);
    const vend = this.st.vendedor();

    this.st.patchVenta({
      cliente:        cli,
      cobranza:       null as any,
      porcDescuento:  0,
      detalle:        this.st.ventaDetalles() as any,
      formaVenta:     cli.formaVentaPref ?? fv ?? undefined,
      esObsequio:     true,
      codVendedorErp: vend?.codVendedorErp,
      vendedor:       vend ?? undefined,
      listaPrecio:    cli.listaPrecio,
      canal:          this.st.canal() ?? undefined,   // ← requerido por backend
    } as any);

    // Normalizar tipoDescuento: 'NiNGUNO' (typo del ng12) → 'NINGUNO'
    // Puede ocurrir si se restauraron detalles guardados con el ng12
    const ventaFinal = {
      ...this.st.venta()!,
      detalle: (this.st.venta()!.detalle as any[] ?? []).map((d: any) => ({
        ...d,
        tipoDescuento: d.tipoDescuento === 'NiNGUNO' ? 'NINGUNO' : (d.tipoDescuento ?? 'NINGUNO'),
      })),
    };

    this.ventaSvc.cerrarVenta({ venta: ventaFinal, descuentos: [] }).subscribe({
      next: (resp: any) => {
        this.st.guardando.set(false);
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
        console.error('[Obsequio] guardar error:', err.status, err.message);
        const m = err.status === 504 ? 'Timeout. Verificá si el obsequio fue guardado.'
                : err.status === 0   ? 'Sin conexión.'
                :                      'Error al guardar.';
        this.toast.error(m);
      }
    });
  }

  limpiar(): void {
    const dep = this.st.deposito();
    if (dep && this.st.ventaDetalles().length > 0)
      this.stockSvc.cancelarComprometido(dep.codDeposito, this.st.ventaDetalles()).subscribe();
    this.st.resetCarrito();
    this.st.modalCobranza.set(false);
    this.st.guardando.set(false);
    this._initVenta();
    // Recargar productos y mantener el cliente propietario
    this.cargarProductos(0, '', 0);
  }

  cancelarStockAlSalir(): void {
    const dep = this.st.deposito();
    if (dep && this.st.ventaDetalles().length > 0)
      this.stockSvc.cancelarComprometido(dep.codDeposito, this.st.ventaDetalles()).subscribe();
  }

  // ── Privados ────────────────────────────────────────────────────────────────

  private _initVenta(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.st.venta.set({
      codVenta: null as any, anulado: false,
      codEmpresaErp: this.user.codEmpresaErp, codSucursalErp: this.user.codSucursalErp,
      codEmpresa: this.user.codEmpresa, codSucursal: this.user.codSucursal,
      estado: 'TEMP', modoEntrega: 'CONTRA_ENTREGA',
      fechaAnulacion: null as any, fechaCreacion: null as any,
      fechaVencimiento: null as any, fechaVenta: today,
      fechaModificacion: null as any, porcDescuento: 0,
      importeDescuento: 0, importeIva5: 0, importeIva10: 0,
      importeIvaExenta: 0, importeNeto: 0, importeTotal: 0,
      descuentoProducto: 0 as any, subTotal: 0, totalKg: 0 as any,
      timbrado: '', inicioTimbrado: '', finTimbrado: '',
      codUsuarioAnulacion: null as any, nroComprobante: '', tipoComprobante: '',
      terminalVenta: this.st.terminal() ?? undefined,
      deposito: this.st.deposito() ?? undefined,
      cobranza: null as any, codUsuarioCreacion: this.user.codUsuario,
      cliente: this.st.cliente() ?? undefined, pedido: null as any,
      formaVenta: this.st.cliente()?.formaVentaPref ?? undefined,
      detalle: null as any, motivoAnulacion: null as any,
      esObsequio: true, editable: false,
      codVendedorErp: this.st.vendedor()?.codVendedorErp ?? '',
      listaPrecio: this.st.listaPrecio() ?? undefined,
      vendedor: this.st.vendedor() ?? undefined,
      tipoVenta: 'POS', canal: this.st.canal() ?? undefined, cupon: null as any,
    });
  }

  /** Recalcula los totales de la cabecera desde los detalles — sin descuentos */
  private _calcularTotal(): void {
    const detalles = this.st.ventaDetalles();
    let subTotal = 0, importeTotal = 0, importeNeto = 0,
        importeIva5 = 0, importeIva10 = 0, importeIvaExenta = 0, totalKg = 0;

    for (const det of detalles) {
      subTotal        += det.subTotal;
      importeTotal    += det.importeTotal;
      importeNeto     += det.importeNeto;
      importeIva5     += det.importeIva5;
      importeIva10    += det.importeIva10;
      importeIvaExenta += det.importeIvaExenta;
      totalKg         += det.totalKg;
    }

    this.st.patchVenta({
      subTotal, importeTotal, importeNeto,
      importeIva5, importeIva10, importeIvaExenta,
      totalKg: totalKg as any, importeDescuento: 0, porcDescuento: 0,
    } as any);
  }
}