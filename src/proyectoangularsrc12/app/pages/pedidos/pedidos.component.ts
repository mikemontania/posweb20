import { CategoriaService } from './../../services/categoria/categoria.service';
import { CategoriaProducto } from './../../models/categoriaProducto.model';
import { Component, OnInit, Inject, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { Precio } from '../../models/precio.model';
import { Descuento } from '../../models/descuento.model';
import { Cliente } from '../../models/cliente.model';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged, switchMap, catchError, timeout } from 'rxjs/operators';
import { ProductoService, ClienteService, PrecioService, DescuentoService, BancosService, VendedorService, FormaVentaService, SucursalesService, ListaPrecioService } from '../../services/service.index';

import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { User } from '../../models/user.model';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { MedioPago } from '../../models/medioPago.model';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';
import { Cobranza } from '../../models/cobranza.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { ToastrService } from 'ngx-toastr';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { TipoMedioPagoService } from '../../services/tipoMedioPago/tipoMedioPago.service';
import { Bancos } from '../../models/bancos.model';
import { LoginService } from '../../services/service.index';
import { ErrModel } from '../../models/ErrModel.model';
import { Pedido } from '../../models/pedido.model';
import { PedidoDetalle } from '../../models/PedidoDetalle.model';
import { PedidoDescuento } from '../../models/PedidoDescuento.model';
import { PedidosService } from '../../services/pedidos/pedidos.service';
import { Vendedor } from '../../models/vendedor.model';
import { Sucursal } from '../../models/sucursal.model';
import { Usuarios } from '../../models/usuarios.model';
import { InputDebounceComponent } from '../../components/inputDebounce/inputDebounce.component';
import { Canal } from 'src/app/models/canales.model';
import { CanalService } from 'src/app/services/canales/canales.service';


@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  /* ===========ARRAYS=================== */
  paginas = [];
  productos: Producto[] = [];
  descuentos: Descuento[] = [];
   canales: Canal[] = [];
  pedidoDescuento: PedidoDescuento[] = [];
  pedidoDetalles: PedidoDetalle[] = [];
  detallesAux: PedidoDetalle[] = [];
  clientes: Cliente[] = [];
  categorias: CategoriaProducto[] = [];
  /* ===========objetos=================== */
  itemDescuento: Descuento;
  user: User;
  selectModelCliente: Cliente;
  cliente: Cliente;
  canal: Canal;
  listaPrecio: ListaPrecio;
  paginador: any;
  pedido: Pedido;
  pedidoDetalleAux: PedidoDetalle;
  categoriaSeleccionada: CategoriaProducto;
  categoriaTodos: CategoriaProducto = {
    'codCategoriaProducto': 0,
    'codCategoriaProductoErp': '99',
    'descripcion': 'Todos',
    'codEmpresa': this._loginServices.user.codEmpresa
  };

  /* ===========string=================== */
  fechaEmision: string;
  fechaVencimiento: string;
  token: string;
  nroRef: string;
  nroCuenta: string;
  mostrarModal: boolean = false;
  modalCliente: string = 'oculto';
  modalCanal: string = 'oculto';
  oculto: string = 'oculto';
  busqueda: string = '';
  rutaPaginador: string = '/pedidos/page';
  razonSocial: string;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  img: string = './assets/images/jabon.png';
  size: string = 'md';
  /* searchModelProducto: any = ''; */
  /* ===========boolean=================== */
  _modoEdicion: boolean = false;
  msgAdvertencia: boolean = false;
  deshabilitarBuscador: boolean = true;
  cargando: boolean = false;
  mostrarCliente: boolean = false;
  mostraCantidad: boolean = false;
  mostrarForm: boolean = false;
  excIva: boolean = false;
  ellipses: boolean = false;
  _tieneDescuentoCliente: boolean = false;
  _tieneDescuentoSucursal: boolean = false;
  _analizarDescuentoImporte: boolean = true;
  _tieneDescuentoGrupo: boolean = false;
  /* ===========number=================== */
  totalElementos: number = 0;
  cantidadElementos: number = 0;
  pagina: number = 0;
  limitePorcentajeDescuento: number = 0;
  porcentajeDescuento: number = 0;
  totalAbonado: number = 0;
  totalSaldo: number = 0;
  _importeDescontable: number = 0;
  cantidad: number = 1;
  montoAbonado: number = 0;
  vuelto: number = 0;
  calculoTotalCantidad: number = 0;
  nroPedido: number = 0;
  /***************mask*********** */
  cobranzasDetalle: CobranzaDetalle[] = [];
  tipoMedioPago: TipoMedioPago[] = [];
  medioPago: MedioPago[] = [];
  bancos: Bancos[] = [];
  listaPedidos: Pedido[] = [];
  errores: ErrModel[] = [];
  sucursales: Sucursal[] = [];
  /* ===========objetos=================== */
  sucursal: Sucursal;
  descuentoImporteActual: Descuento;
  descuentoClienteActual: Descuento;
  descuentoSucursalActual: Descuento;
  descuentoGrupoActual: Descuento;
  cobranza: Cobranza;
  cobranzaAux: Cobranza;
  productoAux: Producto;

  selectModelMedio: MedioPago;
  selectModelTipoMedioPago: TipoMedioPago;
  selectModelBanco: Bancos;
  client: Cliente;
  vendedor: Vendedor;

  /* ===========string=================== */
  fechaInicio: string;
  fechaFin: string;
  modalTerminal: string = 'oculto';
  modalPedidos: string = 'oculto';
  modalDetalles: string = 'oculto';
  formaVentaLabel: string;
  tamanhoPag: string = 'md';
  /* searchModelProducto: any = ''; */
  /* ===========boolean=================== */

  autorizado: boolean = false;
  esContado: boolean = false;

  /* ===========number=================== */
  seleccionTerminal: number;
  seleccionCanal: number;
  pageSizePed: number = 0;
  totalElementosPed: number = 0;
  seleccionFormaVenta = 0;
  codCobranzaDetalle: number = 0;
  paginaPedido: number = 0;
  seleccionMedioPago: number;
  /***************mask*********** */
  @ViewChild('inputProducto') inputProducto: InputDebounceComponent;

  constructor(
    private toastr: ToastrService,
    private location: Location,
    public router: Router,
    public http: HttpClient,
    public _sucursalServices: SucursalesService,
     public _canalServices: CanalService,
    public _productosServices: ProductoService,
    public _vendedorServices: VendedorService,
    public _formaVentaServices: FormaVentaService,
    public _bancosServices: BancosService,
    public _clientesServices: ClienteService,
    public _precioServices: PrecioService,
    public _listaPrecioServices: ListaPrecioService,
    public _descuentoServices: DescuentoService,
    public _loginServices: LoginService,
    public _empresaServices: EmpresasService,
    public _medioPagoServices: MedioPagoService,
    public _tipoMedioPagoServices: TipoMedioPagoService,
    private activatedRoute: ActivatedRoute,
    public _pedidoServices: PedidosService,
    public _categoriaService: CategoriaService,
  ) { }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges() {
    this.min();
    this.razonSocial = this.cliente.razonSocial;
  }

  ngOnInit() {
    this.cargarSucursales();
    this.categoriaSeleccionada = this.categoriaTodos;
    this._analizarDescuentoImporte = true;
    this._modoEdicion = false;
    this.pedidoDetalleAux = null;
    this.min();
    this.deshabilitarBuscador = true;
    this.router.navigate(['/pedidos/page', 0]);
    this.user = this._loginServices.user;
    /*==========Observa la paginación =======================*/
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
      }
      this.traerProductos(page, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
    });
    /*=====================================================*/
    this.cargar(); // se llama a varios servicios para iniciar objetos empreesa,clientes, mediopago ect
  }

  pedidoInit() {
    console.log(this.user);
    this.pedido = {
      codPedido: null,
      anulado: false,
      codEmpresaErp: this.user.codEmpresaErp,
      codSucursalErp: this.sucursal.codSucursalErp,
      codEmpresa: this.user.codEmpresa,
      codSucursal: this.sucursal.codSucursal,
      estado: 'PENDIENTE',
      modoEntrega: 'CONTRA_ENTREGA',
      fechaAnulacion: null,
      fechaCreacion: null,
      fechaPedido: moment(new Date()).format('YYYY-MM-DD'),
      fechaPedidoReal: moment(new Date()).format('YYYY-MM-DD'),
      fechaModificacion: null,
      porcDescuento: 0,
      importeDescuento: 0,
      importeIva5: 0,
      importeIva10: 0,
      importeIvaExenta: 0,
      importeNeto: 0,
      importeTotal: 0,
      descuentoProducto: 0,
      subTotal: 0,
      totalKg: 0,
      nroPedido: null,
      codUsuarioAnulacion: null,
      codUsuarioCreacion: this.user.codUsuario,
      cliente: this.cliente,
      canal:this.canal,
      detalle: this.pedidoDetalles,
      cobranza: null,
      vendedor: null,
      codVendedorErp: null,
      listaPrecio: this.listaPrecio,
      tipoPedido: 'POS',
      cupon: null,
      observacion: null
    };
  }
  iniciarCobranza() {
    this.cobranza = {
      anulado: false,
      codCobranza: null,
      importeCobrado: 0,
      importeAbonado: 0,
      fechaCobranza: moment(new Date()).format('YYYY-MM-DD'),
      saldo: 0,
      detalle: null,
      tipo: 'PEDIDO'
    };
  }

  min() {
    'use strict';
    $(function () {
      $('.preloader').fadeOut();
    });
    jQuery(document).on('click', '.mega-dropdown', function (e) {
      e.stopPropagation();
    });
    // ==============================================================
    // Esto es para la parte superior del encabezado y la parte de la barra lateral
    // ==============================================================
    let set = function () {
      $('body').addClass('mini-sidebar');
      $('.navbar-brand span').hide();
      $('.sidebartoggler i').addClass('ti-menu');
    };
    $().ready(set);
    $().on('resize', set);
  }

  // 01cargar
  // 02minimizar menu
  // 03traer cliente default
  // 04cargar forma venta
  // 05cargar descuentos

  async cargar() {
    this.min(); // no importa en que tiempo se ejecute
    this.porcentajeDescuento = 0;
    this.limitePorcentajeDescuento = this.user.maxDescuentoPorc;
    let Vendedor: Vendedor = await this.getVendedorByCodUser();
    if (!Vendedor) {
      this.router.navigate(['/dashboard']);
      this.invalido('Usuario no es vendedor');
    }
    this.vendedor = Vendedor;

    let categorias = await this.getCategorias();
    if (!categorias) {
      this.router.navigate(['/dashboard']);
      this.invalido('No existen categorias');
    }
    this.categorias = categorias;
    console.log(this.categorias);
    this.categorias.unshift(this.categoriaTodos);

    let sucursal: Sucursal = await this.getSucursal();
    if (!sucursal) {
      this.router.navigate(['/dashboard']);
      this.invalido('Sucursal no puede ser null');
    }
    this.sucursal = sucursal;

    let clienteDefault: Cliente = await this.ClientePredeterminado();
    if (!clienteDefault) {
      this.router.navigate(['/dashboard']);
      this.invalido('No existe cliente Predeterminado');
    }
    this.cliente = clienteDefault;
    this.razonSocial = this.cliente.concatDocNombre;
    this.listaPrecio = this.cliente.listaPrecio;
    if (!this.listaPrecio) {
      this.router.navigate(['/dashboard']);
      this.invalido('El Cliente no posee lista de precio');
    }
    this.pedidoInit();
    this.iniciarCobranza();
    console.log('cliente DEFAULT :', this.cliente);
    this.canales = await this.getCanales();
    if (!this.canales) {
          this.router.navigate(['/dashboard']);
          this.invalido('canal no puede ser null');
    }
    this.canal= await this.getCanalPrincipal(); // esperar el canal primero


    let descuentoImporte: Descuento = await this.getDescuentoByTipo('IMPORTE', this.listaPrecio.codListaPrecio);
    descuentoImporte ? this._analizarDescuentoImporte = true : this._analizarDescuentoImporte = false;
    console.log('_analizarDescuentoImporte', this._analizarDescuentoImporte);
    let buscarDescuentos = await this.buscarDescuentos();
    this.mostrarCliente = true;
    this.deshabilitarBuscador = false;
    this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
  }
async getCanalPrincipal() {
    let canal = this._canalServices.getCanal().toPromise();
    return canal;
  }
  async buscarDescuentos() {
    if (this.cliente.grupoDescuento) {
      if ((this.cliente.grupoDescuento.descuento > 0) && (this.cliente.carnetVencimiento >= moment(new Date()).format('YYYY-MM-DD'))) {
        let porcDescuentoSucursal: number = 0;
        let descuentoSucursal: Descuento = await this.getDescuento('SUCURSAL', 1, 1, this.listaPrecio.codListaPrecio);
        if (descuentoSucursal) {
          porcDescuentoSucursal = 10; //descuentoSucursal.descuento
        }
        console.log('Tiene descuento de grupo');
        let descuentoGrupo: Descuento = {
          codDescuento: 0,
          descripcion: this.cliente.grupoDescuento.descripcion,
          codDescuentoErp: '',
          codEmpresa: this.user.codSucursal,
          codSucursal: this.user.codSucursal,
          listaPrecio: this.listaPrecio,
          tipoDescuento: 'Grupo cliente',
          unidadDescuento: 'PORCENTAJE',
          fechaDesde: new Date(),
          fechaHasta: new Date(),
          producto: null,
          cliente: null,
          medioPago: null,
          descuento: this.cliente.grupoDescuento.descuento + porcDescuentoSucursal,
          cantDesde: 0,
          cantHasta: 99999999,
          activo: true,

        }
        this.descuentoGrupoActual = descuentoGrupo;
        this.porcentajeDescuento = this.porcentajeDescuento + descuentoGrupo.descuento;
        this._tieneDescuentoGrupo = true;
        this._tieneDescuentoSucursal = false;
        this._tieneDescuentoCliente = false;
        this.descuentos.push(descuentoGrupo);
        console.log(this.descuentos);
        return descuentoGrupo;
      } else {
        let descuentoSucursal: Descuento = await this.getDescuento('SUCURSAL', 1, 1, this.listaPrecio.codListaPrecio);
        if (descuentoSucursal) {
          this.descuentoSucursalActual = descuentoSucursal;
          this.porcentajeDescuento = this.porcentajeDescuento + descuentoSucursal.descuento;
          this.descuentos.push(descuentoSucursal);
          console.log('Tiene descuento de sucursal');
          this._tieneDescuentoSucursal = true;
          return descuentoSucursal;
        } else {
          // si no hay descuento sucursal podemos ver si el cliente tiene descuento CLIENTE
          this._tieneDescuentoSucursal = false;
          console.log('No Tiene descuento de sucursal');
          let descuentoCliente: Descuento = await this.getDescuento('CLIENTE', this.cliente.codCliente, 1, this.listaPrecio.codListaPrecio);
          if (descuentoCliente) {
            console.log('Tiene descuento de cliente');
            this.descuentoClienteActual = descuentoCliente;
            this.porcentajeDescuento = this.porcentajeDescuento + descuentoCliente.descuento;
            this._tieneDescuentoCliente = true;
            this.descuentos.push(descuentoCliente);
            console.log(this.descuentos);
            return descuentoCliente;
          } else {
            this._tieneDescuentoCliente = false;
            console.log('Cliente no tiene descuento ***');
            return null;
          }
        }
      }
    } else {
      this.router.navigate(['/dashboard']);
      this.invalido('El Cliente no posee grupo descuento');
    }

  }


  /**
   * 1 traer el precio del producto y retornar sin seleccion si no tiene precio
   * 2 hallar el total de item
   * 3 cargar item
   * 4 verificar si el item existe o no en el array
   * 4.1 si existe el item aumentar la cantidad ,total, totalVenta y totalDescuento
   * 4.1.1 se resetean el objeto item y se llama traerdescuentoProducto(producto) enviando nuevamente producto
   * 4.2 si no existe agregamos un item
   * 4.2.1 se resetean el objeto item y se llama traerdescuentoProducto(producto) enviando nuevamente producto
   */


  async seleccionarProducto(producto: Producto) {
    if (this.cantidad <= 0) {
      this.invalido('Cantidad debe ser mayor a 0');
      return;
    }
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    if (this.cantidad <= 0) {
      Swal.close();
      this.invalido('Cantidad no puede ser 0');
    }
    let indice: number = 0;
    let precio: Precio = null;
    indice = this.pedidoDetalles.findIndex((d) => d.producto.codProducto == producto.codProducto);
    // =========== ==============     si no existe en el array ==================
    if (indice == -1) {
      let pedidoDetalles: PedidoDetalle;
      pedidoDetalles = {
        codPedidoDetalle: null,
        nroItem: (this.pedidoDetalles.length + 1),
        cantidad: 0,
        importeDescuento: 0,
        importeIva5: 0,
        importeIva10: 0,
        importeIvaExenta: 0,
        importeNeto: 0,
        importePrecio: 0,
        importeTotal: 0,
        subTotal: 0,
        totalKg: 0,
        porcDescuento: 0,
        porcIva: 0,
        producto: producto,
        unidadMedida: null,
        pedido: null,
        vendedor: null,
        codVendedorErp: null,
        tipoDescuento: ''
      };
      precio = await this.getPrecio(this.cantidad, producto.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
      if (!precio) {
        Swal.close();
        this.invalido('El producto no tiene precio');
        return;
      }
      this.pedidoDetalles.push(pedidoDetalles);
      indice = this.pedidoDetalles.findIndex((d) => d.producto.codProducto == producto.codProducto);
      this.pedidoDetalles[indice].cantidad = this.pedidoDetalles[indice].cantidad + this.cantidad;
      this.pedidoDetalles[indice].vendedor = this.vendedor;
      this.pedidoDetalles[indice].codVendedorErp = this.vendedor.codVendedorErp;
      // =========== ========================  si ya existe en el array ==================
    } else {
      this.pedidoDetalles[indice].cantidad = this.pedidoDetalles[indice].cantidad + this.cantidad;
      precio = await this.getPrecio(this.pedidoDetalles[indice].cantidad, producto.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
    }
    if (precio) {
      // si el producto tiene precio
      this.pedidoDetalles[indice].importePrecio = precio.precio;
      this.pedidoDetalles[indice].porcIva = producto.iva;
      if (this.cliente.excentoIva == true) {
        if (this.pedidoDetalles[indice].producto.iva == 0) {
          this.pedidoDetalles[indice].importePrecio = precio.precio;
        } else if (this.pedidoDetalles[indice].producto.iva == 5) {
          this.pedidoDetalles[indice].importePrecio =
            precio.precio - Math.round(precio.precio / 21);
        } else if (this.pedidoDetalles[indice].producto.iva == 10) {
          this.pedidoDetalles[indice].importePrecio =
            precio.precio - Math.round(precio.precio / 11);
        }
      }
      this.pedidoDetalles[indice].unidadMedida = precio.unidadMedida;
      this.pedidoDetalles[indice].totalKg = this.pedidoDetalles[indice].cantidad * this.pedidoDetalles[indice].producto.peso;
      this.pedidoDetalles[indice].subTotal = this.pedidoDetalles[indice].cantidad * this.pedidoDetalles[indice].importePrecio;
      this.pedidoDetalles[indice].importeDescuento = 0;
      this.pedidoDetalles[indice].porcDescuento = 0;

      if (this.pedidoDetalles[indice].producto.sinDescuento == false) {
        let productoDescuento: Descuento = await this.getDescuento('PRODUCTO', this.pedidoDetalles[indice].producto.codProducto, this.pedidoDetalles[indice].cantidad, this.listaPrecio.codListaPrecio);
        if (productoDescuento) {
          this.pedidoDetalles[indice].tipoDescuento = 'PRODUCTO';
          if (productoDescuento.unidadDescuento == 'PORCENTAJE') {
            this.pedidoDetalles[indice].porcDescuento = productoDescuento.descuento;
            this.pedidoDetalles[indice].importeDescuento = Math.round((this.pedidoDetalles[indice].subTotal * this.pedidoDetalles[indice].porcDescuento) / 100);
            this.pedidoDetalles[indice].importeTotal = this.pedidoDetalles[indice].subTotal - this.pedidoDetalles[indice].importeDescuento;
          } else if (productoDescuento.unidadDescuento == 'IMPORTE') {
            let auxDescuento = productoDescuento.descuento * this.pedidoDetalles[indice].cantidad;
            this.pedidoDetalles[indice].porcDescuento = Math.round((auxDescuento * 100) / this.pedidoDetalles[indice].subTotal);
            this.pedidoDetalles[indice].importeDescuento = auxDescuento;
          }
        } else {
          let unoDeDosDescuento: Descuento = await this.getDescuento('UNO_DE_DOS', this.pedidoDetalles[indice].producto.codProducto, this.pedidoDetalles[indice].cantidad, this.listaPrecio.codListaPrecio);
          console.log('UNO_DE_DOS', unoDeDosDescuento);
          if (unoDeDosDescuento) {
            this.pedidoDetalles[indice].tipoDescuento = 'UNO_DE_DOS';
            if (this.pedidoDetalles[indice].cantidad >= 2) {
              //se guarda el porcentaje de descuento
              this.pedidoDetalles[indice].porcDescuento = unoDeDosDescuento.descuento;
              // se guarda el numero de producto que tendran descuento
              let numeroDescuentos = Math.floor(this.pedidoDetalles[indice].cantidad / 2);
              // se calcula el descuento por precio
              let descuentoPorPrecio = Math.round((this.pedidoDetalles[indice].importePrecio * this.pedidoDetalles[indice].porcDescuento) / 100);
              // se calcula el descuento
              this.pedidoDetalles[indice].importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
              this.pedidoDetalles[indice].importeTotal = this.pedidoDetalles[indice].subTotal - this.pedidoDetalles[indice].importeDescuento;
            }
          } else {
            //this.pedidoDetalles[indice].importeDescuento = Math.round((this.pedidoDetalles[indice].subTotal * this.porcentajeDescuento) / 100);
            let unoDeTresDescuento: Descuento = await this.getDescuento('UNO_DE_TRES', this.pedidoDetalles[indice].producto.codProducto, this.pedidoDetalles[indice].cantidad, this.listaPrecio.codListaPrecio);
            console.log('UNO_DE_TRES', unoDeTresDescuento);
            if (unoDeTresDescuento) {
              this.pedidoDetalles[indice].tipoDescuento = 'UNO_DE_TRES';
              if (this.pedidoDetalles[indice].cantidad >= 3) {
                //se guarda el porcentaje de descuento
                this.pedidoDetalles[indice].porcDescuento = unoDeTresDescuento.descuento;
                // se guarda el numero de producto que tendran descuento
                let numeroDescuentos = Math.floor(this.pedidoDetalles[indice].cantidad / 3);
                // se calcula el descuento por precio
                let descuentoPorPrecio = Math.round((this.pedidoDetalles[indice].importePrecio * this.pedidoDetalles[indice].porcDescuento) / 100);
                // se calcula el descuento
                this.pedidoDetalles[indice].importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
                this.pedidoDetalles[indice].importeTotal = this.pedidoDetalles[indice].subTotal - this.pedidoDetalles[indice].importeDescuento;
              }
            } else {
              if (this.descuentoSucursalActual) {
                this.pedidoDetalles[indice].tipoDescuento = 'SUCURSAL';
              } else if (this.descuentoClienteActual) {
                this.pedidoDetalles[indice].tipoDescuento = 'CLIENTE';
              } else {
                this.pedidoDetalles[indice].tipoDescuento = 'IMPORTE';
              }
              this.pedidoDetalles[indice].importeDescuento = Math.round((this.pedidoDetalles[indice].subTotal * this.porcentajeDescuento) / 100);
            }
          }
        }
      }
      this.pedidoDetalles[indice].importeTotal = this.pedidoDetalles[indice].subTotal - this.pedidoDetalles[indice].importeDescuento;
      if (this.cliente.excentoIva == false) {
        switch (this.pedidoDetalles[indice].porcIva) {
          case 0:
            {
              this.pedidoDetalles[indice].importeIva5 = 0;
              this.pedidoDetalles[indice].importeIva10 = 0;
              this.pedidoDetalles[indice].importeIvaExenta = this.pedidoDetalles[indice].importeTotal;
              this.pedidoDetalles[indice].importeNeto = this.pedidoDetalles[indice].importeTotal;
            }
            break;
          case 5:
            {
              this.pedidoDetalles[indice].importeIva5 = Math.round(this.pedidoDetalles[indice].importeTotal / 21);
              this.pedidoDetalles[indice].importeIva10 = 0;
              this.pedidoDetalles[indice].importeIvaExenta = 0;
              this.pedidoDetalles[indice].importeNeto = this.pedidoDetalles[indice].importeTotal - this.pedidoDetalles[indice].importeIva5;
            }
            break;
          case 10:
            {
              if (this.pedidoDetalles[indice].producto.ivaEspecial == true) {
                this.pedidoDetalles[indice].importeIvaExenta = Math.round(this.pedidoDetalles[indice].importeTotal / 2.1);
                let gravada = Math.round(this.pedidoDetalles[indice].importeIvaExenta * 1.1);
                this.pedidoDetalles[indice].importeIva10 = Math.round(gravada / 11);
                this.pedidoDetalles[indice].importeIva5 = 0;
                this.pedidoDetalles[indice].importeNeto = this.pedidoDetalles[indice].importeTotal - this.pedidoDetalles[indice].importeIva10;
              } else {
                this.pedidoDetalles[indice].importeIva10 = Math.round(this.pedidoDetalles[indice].importeTotal / 11);
                this.pedidoDetalles[indice].importeIva5 = 0;
                this.pedidoDetalles[indice].importeIvaExenta = 0;
                this.pedidoDetalles[indice].importeNeto = this.pedidoDetalles[indice].importeTotal - this.pedidoDetalles[indice].importeIva10;
              }
            }
            break;
          default:
            break;
        }
      } else {
        this.pedidoDetalles[indice].porcIva = 0;
        this.pedidoDetalles[indice].importeIva5 = 0;
        this.pedidoDetalles[indice].importeIva10 = 0;
        this.pedidoDetalles[indice].importeIvaExenta = this.pedidoDetalles[indice].importeTotal;
        this.pedidoDetalles[indice].importeNeto = this.pedidoDetalles[indice].importeTotal;
      }

      /****cambiar de ubicacion el elemento* */
      let detalleItemAux: PedidoDetalle = this.pedidoDetalles[indice];
      let index = this.pedidoDetalles.indexOf(this.pedidoDetalles[indice]);
      this.pedidoDetalles.splice(index, 1);
      this.pedidoDetalles.push(detalleItemAux); /// insertar
      /******************* */

      this.notificacionProducto(this.pedidoDetalles[indice].producto);
      let x = await this.reHacer();
      this.busqueda = '';
      $('#inputDebounce').val('');
      this.cantidad = 1;
      Swal.close();
      return true;
    } else {
      this.invalido('El producto no tiene precio');
      Swal.close();
      return false;
    }
  }

  async seleccionarCliente(item: Cliente) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    this._tieneDescuentoGrupo = false;
    this._tieneDescuentoSucursal = false;
    this._tieneDescuentoCliente = false;
    this.limitePorcentajeDescuento = this.user.maxDescuentoPorc;
    this.porcentajeDescuento = 0;
    this.pedidoInit(); // no importa en que tiempo se ejecute mientras exista cliente default
    this.iniciarCobranza(); // no importa en que tiempo se ejecute mientras exista cliente default
    this.cliente = item;
    if (this.cliente) {
      this.razonSocial = this.cliente.concatDocNombre;
      this.listaPrecio = this.cliente.listaPrecio;
      if (!this.listaPrecio) {
        this.router.navigate(['/dashboard']);
        this.invalido('El Cliente no posee lista de precio');
      }
      if (this.cliente.formaVentaPref.esContado == true) {
        this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
        this.esContado = true;
      } else {
        this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
        this.esContado = false;
      }
      let categorias = await this.getCategorias();
      if (!categorias) {
        this.router.navigate(['/dashboard']);
        this.invalido('No existen categorias');
      }
      this.categorias = categorias;
      console.log(this.categorias);
      this.categorias.unshift(this.categoriaTodos);

      let descuentoImporte: Descuento = await this.getDescuentoByTipo('IMPORTE', this.listaPrecio.codListaPrecio);
      descuentoImporte ? this._analizarDescuentoImporte = true : this._analizarDescuentoImporte = false;
      console.log('_analizarDescuentoImporte', this._analizarDescuentoImporte);
      let buscarDescuentos: any = await this.buscarDescuentos();
      this.mostrarCliente = true;
      this.deshabilitarBuscador = false;
      this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
      if (localStorage.getItem('detalles')) {
        /***Si existe en el localStorage ******/
        this.pedidoDetalles = JSON.parse(window.atob(localStorage.getItem('detalles')));
        let a = await this.reHacerDetallesPorPrecio();
        let b = await this.reHacer();
        localStorage.removeItem('detalles');
      }
      if (this.pedidoDetalles.length > 0) {
        /***Si existe pedido ******/
        console.log(' /***Si existe pedido ******/');
        let a = await this.reHacerDetallesPorPrecio();
        let b = await this.reHacer();
      }
    }
    Swal.close();
  }

  cambiarCliente() {
    this.deshabilitarBuscador = true;
    this.codCobranzaDetalle = 0;
    this.oculto = 'oculto';
    this.cargando = false;
    this.paginas.length = 0;
    this.calculoTotalCantidad = 0;
    this.porcentajeDescuento = 0;
    this.limitePorcentajeDescuento = 0;
    this.porcentajeDescuento = 0;
    this.totalElementos = 0;
    this.cantidadElementos = 0;
    this.totalAbonado = 0;
    this.cantidad = 1;
    this.montoAbonado = 0;
    this.vuelto = 0;
    this.seleccionFormaVenta = 0;
    this.pedidoDescuento.splice(0, this.pedidoDescuento.length);
    this.pedidoDetalles.splice(0, this.pedidoDetalles.length);
    this.cobranzasDetalle.splice(0, this.cobranzasDetalle.length);
    this.descuentos.splice(0, this.descuentos.length);
    this.descuentoImporteActual = null;
    this.clientes.splice(0, this.clientes.length);
    this.productos.splice(0, this.productos.length);
    this.nroRef = '';
    $('#typeahead-http').val('');
    this.mostrarCliente = false;
    this.pedidoInit();
    this.iniciarCobranza();
  }
  cargarSucursales() {
    this._sucursalServices.traerSucursales(this._loginServices.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.sucursales = resp;
    });
  }


  quitarCobranza(item: CobranzaDetalle) {
    this.totalAbonado = this.totalAbonado - item.importeAbonado;
    let indice = this.cobranzasDetalle.indexOf(item);
    this.cobranzasDetalle.splice(indice, 1);
    if (this.cobranza.importeCobrado >= this.totalAbonado) {
      this.vuelto = 0;
    } else {
      this.vuelto = this.totalAbonado - this.cobranza.importeCobrado;
    }
  }

  async quitarDescuento(descuento: Descuento) {
    console.log(descuento);
    if (descuento.tipoDescuento == 'SUCURSAL') {
      this._tieneDescuentoSucursal = false;
    }
    let indice = this.descuentos.indexOf(descuento);
    this.porcentajeDescuento = this.porcentajeDescuento - descuento.descuento;
    this.descuentos.splice(indice, 1);
    let x = await this.reHacer();
  }

  async quitarProductoCompleto(item: PedidoDetalle) {

    let indice = this.descuentos.findIndex((d) => d.tipoDescuento == 'PRODUCTO' && d.producto.codProducto == item.producto.codProducto);
    if (indice > -1) {
      this.porcentajeDescuento =
        this.porcentajeDescuento - this.descuentos[indice].descuento;
      this.descuentos.splice(indice, 1);
      let index = this.pedidoDetalles.indexOf(item);
      this.pedidoDetalles.splice(index, 1);
    } else {
      let index = this.pedidoDetalles.indexOf(item);
      this.pedidoDetalles.splice(index, 1);
    }
    this._importeDescontable = 0;
    let w = await this.reHacerDetallesPorPrecio();
    let x = await this.reHacer();
    this.ordenarNroItem();
  }


  cambioCliente(value: Cliente) {
    console.log(this.clientes);
    this.pedidoInit();
    console.log(this.pedido);
    this.cargarProductos();
  }

  async cambioSucursal(sucursal: Sucursal) {
    if (sucursal) {
      this.sucursal = sucursal;
      this.pedido.codSucursal = sucursal.codSucursal;
      this.pedido.codSucursalErp = sucursal.codSucursalErp;
     let changeUsuarioSucursal= await this.changeSucursal(sucursal.codSucursal);
      this._loginServices.user.codSucursal = changeUsuarioSucursal.sucursal.codSucursal;
      this._loginServices.user.codSucursalErp = changeUsuarioSucursal.sucursal.codSucursalErp;
      let actualizartoken = await this.actualizarToken();
    }
  }

   async cambioCanal(canal: any) {
    if (canal) {
      this.canal = canal;
      this.pedido.canal = canal;
    }
  }

  async actualizarToken() {
    let token = this._loginServices.actualizarToken().toPromise();
    return token;
  }
  cambiarValor(valor: number) {
    if (this.cantidad <= 0 && valor < 0) {
      this.cantidad = 0;
      return;
    }
    this.cantidad = this.cantidad + valor;
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 2200 });
    Swal.fire('Atención', invalido, 'warning');
  }

  agregarCobranza() {
    if (this.montoAbonado < 100) {
      //  SI MONTO ES MENOR A 100
      this.invalido('Monto de cobranza no puede ser menor a 100 Gs.');
      return;
    }
    if (!this.selectModelMedio) {
      // SI NO SE SELECCIONA MEDIO PAGO
      this.invalido('Medio pago no puede ser nulo');
      return;
    }
    if (this.selectModelMedio) {
      // SI SE SELECCIONA MEDIO PAGO Y NO SE COMPLETA LOS DATOS REQUERIDOS
      if (this.selectModelMedio.tieneBanco && !this.selectModelBanco) {
        // TIENE BANCO
        this.invalido('Banco no puede ser nulo');
        return;
      }
      if (this.selectModelMedio.tieneTipo && !this.selectModelTipoMedioPago) {
        // TIENE TIPO
        this.invalido('Tipo no puede ser nulo');
        return;
      }
      if (this.selectModelMedio.tieneRef && !this.nroRef) {
        // TIENE REF
        this.invalido(
          'Numero de referencia no puede ser nulo no puede ser nulo'
        );
        return;
      }
      if (this.selectModelMedio.esCheque) {
        // SI ES CHEQUE
        if (!this.fechaEmision) {
          this.invalido('Fecha de emision no puede ser nulo');
          return;
        }
        if (!this.fechaVencimiento) {
          this.invalido(
            'Fecha de vencimiento no puede ser nulo no puede ser nulo'
          );
          return;
        }
        if (!this.nroRef) {
          this.invalido('Numero de referencia no puede ser nulo');
          return;
        }
        if (!this.nroCuenta) {
          this.invalido('Numero cuenta no puede ser nulo no puede ser nulo');
          return;
        }
      }
    }
    this.vuelto = this.totalAbonado - this.cobranza.importeCobrado;
    if (this.codCobranzaDetalle === 0) {
      this.codCobranzaDetalle = 1;
    }
    console.log('agregar cobranza');
    let detalleCobranza: CobranzaDetalle;
    detalleCobranza = {
      codCobranzaDetalle: this.codCobranzaDetalle,
      importeAbonado: this.montoAbonado,
      importeCobrado: 0,
      saldo: 0,
      medioPago: this.selectModelMedio,
      tipoMedioPago: this.selectModelTipoMedioPago,
      fechaEmision: this.fechaEmision,
      fechaVencimiento: this.fechaVencimiento,
      nroRef: this.nroRef,
      banco: this.selectModelBanco,
      nroCuenta: this.nroCuenta,
    };
    this.codCobranzaDetalle = this.codCobranzaDetalle + 1;
    let bandera: boolean = true;

    for (let indice = 0; indice < this.cobranzasDetalle.length; indice++) {
      console.log('agregar cobranza');
      console.log(this.cobranzasDetalle[indice]);
      if (
        this.cobranzasDetalle[indice].medioPago.codMedioPago ===
        detalleCobranza.medioPago.codMedioPago
      ) {
        console.log('existe.. entonces se aumenta');
        this.cobranzasDetalle[indice].importeAbonado = this.cobranzasDetalle[indice].importeAbonado + detalleCobranza.importeAbonado;
        this.cobranzasDetalle[indice].importeCobrado = this.cobranzasDetalle[indice].importeCobrado + detalleCobranza.importeCobrado;
        this.cobranzasDetalle[indice].saldo = this.cobranzasDetalle[indice].saldo + detalleCobranza.saldo;
        this.totalAbonado += detalleCobranza.importeAbonado;
        this.cobranza.importeCobrado = Math.round(this.pedido.importeTotal);
        this.vuelto = this.totalAbonado - this.cobranza.importeCobrado;
        this.montoAbonado = 0;
        this.selectModelMedio = null;
        this.cambioMedioPago(this.cliente.medioPagoPref.codMedioPago);
        this.selectModelBanco = null;
        this.fechaEmision = null;
        this.fechaVencimiento = null;
        console.log(this.cobranzasDetalle);
        return (bandera = false);
      }
      bandera = true;
    }
    if (bandera === true) {
      console.log('no existe.. entonces se agrega');
      this.cobranzasDetalle.push(detalleCobranza);
      console.log(this.cobranzasDetalle);
      this.totalAbonado += detalleCobranza.importeAbonado;
      this.cobranza.importeCobrado = Math.round(this.pedido.importeTotal);
      this.vuelto = this.totalAbonado - this.cobranza.importeCobrado;
      this.montoAbonado = 0;
      this.cambioMedioPago(this.cliente.medioPagoPref.codMedioPago);
      this.selectModelTipoMedioPago = null;
      this.selectModelBanco = null;
      this.fechaEmision = null;
      this.fechaVencimiento = null;
    }
  }

  cambioMedioPago(cod: number) {
    this.montoAbonado = 0;
    this.selectModelBanco = null;
    this.fechaEmision = null;
    this.fechaVencimiento = null;
    this.nroCuenta = null;
    this.nroRef = null;
    this.seleccionMedioPago = cod;
    console.log('cod medio pago ', cod);
    console.log(this.seleccionMedioPago);
    for (let indice = 0; indice < this.medioPago.length; indice++) {
      // tslint:disable-next-line:triple-equals
      if (this.medioPago[indice].codMedioPago == cod) {
        this.selectModelMedio = this.medioPago[indice];
      }
    }
  }

  cambioTipo(event) {
    console.log(event);
    this.montoAbonado = 0;
    this.selectModelBanco = null;
    this.fechaEmision = null;
    this.fechaVencimiento = null;
    this.nroCuenta = null;
    this.nroRef = null;
  }

  cambioBanco(event) {
    this.montoAbonado = 0;
    this.fechaEmision = null;
    this.fechaVencimiento = null;
    this.nroCuenta = null;
    this.nroRef = null;
  }

  buscarProducto(termino: string) {
    this.router.navigate(['/pedidos/page', 0]);
    console.log(' buscarProducto');
    debounceTime(300);
    distinctUntilChanged();
    if (termino.length <= 2) {
      this.busqueda = '';
      this.traerProductos(0, '', this.categoriaSeleccionada.codCategoriaProducto);
      return;
    }
    this.cargando = true;
    this.busqueda = termino.toUpperCase();
    this.traerProductos(0, termino.toUpperCase(), this.categoriaSeleccionada.codCategoriaProducto);
  }

  ordenarNroItem() {
    for (let i = 0; i < this.pedidoDetalles.length; i++) {
      this.pedidoDetalles[i].nroItem = i + 1;
    }
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }


  traerProductos(page, termino, codCategoria) {
    this._productosServices.traerProductosActivosPorPaginas(page, termino, codCategoria)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        this.productos = response.content as Producto[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.productos = [];
        } else {
          this.cargando = false;
        }

        if (response) {
          if (response.numberOfElements === 1 && termino.length > 8) {
            let producto: Producto = this.productos[0];
            this.seleccionarProducto(producto);
            this.traerProductos(0, '', 0);
            // $('#inputDebounce').val('');
            // document.getElementById('inputDebounce').focus();
          }
        }
        if (this.inputProducto) {
          this.inputProducto.inputValue = '';
          this.inputProducto.enfocar();
        }
      });
  }


  cargarProductos() {
    this._productosServices.traerProductos().subscribe((resp: any) => {
      this.productos = resp.content;
      this.paginador = resp;
      this.paginas = this.productos;
      console.log(this.paginador);
    });
  }

  async restarProducto(item: PedidoDetalle) {
    if (item.cantidad === 1) {
      // == Si existe un solo producto
      return;
    } else if (item.cantidad > 1) {

      let indice = this.pedidoDetalles.indexOf(item); // traer indice
      this.pedidoDetalles[indice].cantidad = this.pedidoDetalles[indice].cantidad - 1;
      let w = await this.reHacerDetallesPorPrecio();
      let x = await this.reHacer();
    }
  }

  async reHacer() {
    if (this.cliente.listaPrecio.codListaPrecio != this.listaPrecio.codListaPrecio) {
      let tipoEcommerce = await this.reHacerDetallesPorPrecio();
    }
    let a = await this.reHacerTotal();
    let b = await this.calcularDescuentoImporte().then(() => console.log('Termino calcularDescuentoImporte'));
    let c = await this.reHacerDetalles();
    let d = await this.reHacerTotal();
  }


  calcularDescuentoImporte(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (this._analizarDescuentoImporte == true && this._tieneDescuentoSucursal == false && this._tieneDescuentoCliente == false && this._tieneDescuentoGrupo == false) {
        console.log('_importeDescontable', this._importeDescontable);
        let descuentoImporteNuevo: Descuento = await this.getDescuento('IMPORTE', 1, this._importeDescontable, this.listaPrecio.codListaPrecio);
        if (descuentoImporteNuevo) {
          console.log('descuentoImporteNuevo', descuentoImporteNuevo);
          let index = this.descuentos.findIndex((d) => d.tipoDescuento == 'IMPORTE');
          if (this.descuentoImporteActual) {
            if (this.descuentoImporteActual.descuento == descuentoImporteNuevo.descuento) {
              console.log('condicion 1');
              console.log('es el mismo descuento');
            } else if (this.descuentoImporteActual.descuento > descuentoImporteNuevo.descuento) {
              console.log('condicion 2');
              console.log('this.descuentoImporteActual.descuento', this.descuentoImporteActual.descuento);
              console.log('descuentoImporteNuevo.descuento', descuentoImporteNuevo.descuento);
              console.log('intercambiar sin modificar descuento');
              this.porcentajeDescuento = this.porcentajeDescuento - this.descuentos[index].descuento;
              this.descuentos.splice(index, 1); // quito el descuento
              this.porcentajeDescuento = this.porcentajeDescuento + descuentoImporteNuevo.descuento;
              this.descuentos.push(descuentoImporteNuevo);
              this.descuentoImporteActual = descuentoImporteNuevo;
            } else if (this.descuentoImporteActual.descuento < descuentoImporteNuevo.descuento &&
              (this.limitePorcentajeDescuento >= ((this.porcentajeDescuento - this.descuentos[index].descuento) + descuentoImporteNuevo.descuento))) {
              console.log('condicion 3');
              console.log('INDICE', index);
              console.log('descuentos', this.descuentos[index]);
              let porcentajeSinActual = this.porcentajeDescuento - this.descuentoImporteActual.descuento;
              this.porcentajeDescuento = this.porcentajeDescuento - this.descuentos[index].descuento;
              this.descuentos.splice(index, 1); // quito el descuento
              this.porcentajeDescuento = this.porcentajeDescuento + descuentoImporteNuevo.descuento;
              this.descuentos.push(descuentoImporteNuevo);
              this.descuentoImporteActual = descuentoImporteNuevo;
            } else if (this.descuentoImporteActual.descuento < descuentoImporteNuevo.descuento && ((this.porcentajeDescuento - this.descuentos[index].descuento) + descuentoImporteNuevo.descuento)) {
              console.log('condicion 4');
              console.log('INDICE', index);
              console.log('descuentos', this.descuentos[index]);
              let porcentajeSinActual = this.porcentajeDescuento - this.descuentoImporteActual.descuento;
              this.porcentajeDescuento = this.porcentajeDescuento - this.descuentos[index].descuento;
              this.descuentos.splice(index, 1); // quito el descuento
              descuentoImporteNuevo.descuento = this.limitePorcentajeDescuento - this.porcentajeDescuento;
              this.porcentajeDescuento = this.porcentajeDescuento + descuentoImporteNuevo.descuento;
              this.descuentos.push(descuentoImporteNuevo);
              this.descuentoImporteActual = descuentoImporteNuevo;
            }
            resolve(true);
          } else {
            // si no hay importe en el array
            console.log('ningun descuento importe...');
            console.log('porcentaje', this.porcentajeDescuento);
            console.log('limite ', this.limitePorcentajeDescuento);
            console.log('descuentoImporteNuevo ', descuentoImporteNuevo.descuento);
            if (this.limitePorcentajeDescuento >= this.porcentajeDescuento + descuentoImporteNuevo.descuento) {
              console.log('condicion4');
              this.porcentajeDescuento = this.porcentajeDescuento + descuentoImporteNuevo.descuento;
              this.descuentos.push(descuentoImporteNuevo);
              this.descuentoImporteActual = descuentoImporteNuevo;
              console.log('se agrega descuento por IMPORTE nuevo por diferencia');
            } else if (this.limitePorcentajeDescuento < descuentoImporteNuevo.descuento + this.porcentajeDescuento) {
              console.log('condicion 5');
              descuentoImporteNuevo.descuento = this.limitePorcentajeDescuento - this.porcentajeDescuento;
              this.porcentajeDescuento = this.porcentajeDescuento + descuentoImporteNuevo.descuento;
              this.descuentos.push(descuentoImporteNuevo);
              this.descuentoImporteActual = descuentoImporteNuevo;
            }
            resolve(true);
          }
        } else {
          console.log('NO TIENE DESCUENTO NUEVO IMPORTE');
          if (this.descuentoImporteActual) {
            let index = this.descuentos.findIndex((d) => d.tipoDescuento == 'IMPORTE' && d.cantDesde > this._importeDescontable);
            this.porcentajeDescuento = this.porcentajeDescuento - this.descuentos[index].descuento;
            this.descuentos.splice(index, 1); // quito el descuento
            this.descuentoImporteActual = null;
            resolve(true);
          }
        }
      } else {
        resolve(true);
      }
      resolve(true);
    });
  }

  async reHacerTotal() {
    this.calculoTotalCantidad = 0;
    this.pedido.importeDescuento = 0;
    this.pedido.importeTotal = 0;
    this._importeDescontable = 0;
    this.pedido.importeNeto = 0;
    this.pedido.subTotal = 0;
    this.pedido.importeIvaExenta = 0;
    this.pedido.importeIva5 = 0;
    this.pedido.importeIva10 = 0;
    this.pedido.totalKg = 0;
    this.pedido.descuentoProducto = 0;
    console.log('***********************reHacerTotal*******************');
    for await (const detalle of this.pedidoDetalles) {
      this.calculoTotalCantidad = this.calculoTotalCantidad + detalle.cantidad;
      this.pedido.subTotal = this.pedido.subTotal + detalle.subTotal;
      this.pedido.importeIva5 = this.pedido.importeIva5 + detalle.importeIva5;
      this.pedido.importeIva10 = this.pedido.importeIva10 + detalle.importeIva10;
      this.pedido.importeIvaExenta = this.pedido.importeIvaExenta + detalle.importeIvaExenta;
      if (detalle.producto.sinDescuento == false) {
        if (detalle.porcDescuento == 0) {
          this._importeDescontable = this._importeDescontable + detalle.subTotal;
          this.pedido.importeDescuento = this.pedido.importeDescuento + detalle.importeDescuento;
        } else {
          this.pedido.importeDescuento = this.pedido.importeDescuento + 0;
        }

        if (detalle.tipoDescuento == 'PRODUCTO' || detalle.tipoDescuento == 'UNO_DE_DOS' || detalle.tipoDescuento == 'UNO_DE_TRES') {
          this.pedido.descuentoProducto = this.pedido.descuentoProducto + detalle.importeDescuento;
        }

      } else {
        detalle.importeDescuento = 0;
        this.pedido.importeDescuento = this.pedido.importeDescuento + detalle.importeDescuento;
      }
      this.pedido.totalKg = this.pedido.totalKg + detalle.totalKg;
      this.pedido.importeNeto = this.pedido.importeNeto + detalle.importeNeto;
      this.pedido.importeTotal = this.pedido.importeTotal + detalle.importeTotal;

      console.log('fin vuelta total');
    }
    console.log('***********************Fin reHacerTotal *******************');
  }


  async reHacerDetallesPorPrecio() {
    console.log('***********************reHacerDetallesPorPrecio*******************');
    for await (const detalle of this.pedidoDetalles) {
      let precio = await this.getPrecio(detalle.cantidad, detalle.producto.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
      if (precio) {
        detalle.porcIva = detalle.porcIva;
        detalle.importePrecio = precio.precio;
        if (this.cliente.excentoIva == true) {
          if (detalle.producto.iva == 0) {
            detalle.importePrecio = precio.precio;
          } else if (detalle.producto.iva == 5) {
            detalle.importePrecio = precio.precio - Math.round(precio.precio / 21);
          } else if (detalle.producto.iva == 10) {
            detalle.importePrecio = precio.precio - Math.round(precio.precio / 11);
          }
        }
        detalle.totalKg = detalle.cantidad * detalle.producto.peso;
        detalle.subTotal = detalle.cantidad * detalle.importePrecio;
        detalle.porcDescuento = 0;
        detalle.importeDescuento = 0;
        if (detalle.producto.sinDescuento == false) {
          let productoDescuento: Descuento = await this.getDescuento('PRODUCTO', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
          if (productoDescuento) {
            detalle.tipoDescuento = 'PRODUCTO';
            if (productoDescuento.unidadDescuento == 'PORCENTAJE') {
              detalle.porcDescuento = productoDescuento.descuento;
              detalle.importeDescuento = Math.round((detalle.subTotal * detalle.porcDescuento) / 100);
              detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
            } else if (productoDescuento.unidadDescuento == 'IMPORTE') {
              let auxDescuento = productoDescuento.descuento * detalle.cantidad;
              detalle.porcDescuento = ((auxDescuento * 100) / detalle.subTotal);
              detalle.importeDescuento = auxDescuento;
            }

          } else {
            let unoDeDosDescuento: Descuento = await this.getDescuento('UNO_DE_DOS', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
            if (unoDeDosDescuento) {
              detalle.tipoDescuento = 'UNO_DE_DOS';
              if (detalle.cantidad >= 2) {
                //se guarda el porcentaje de descuento
                detalle.porcDescuento = unoDeDosDescuento.descuento;
                // se guarda el numero de producto que tendran descuento
                let numeroDescuentos = Math.floor(detalle.cantidad / 2);
                // se calcula el descuento por precio
                let descuentoPorPrecio = Math.round((detalle.importePrecio * detalle.porcDescuento) / 100);
                // se calcula el descuento
                detalle.importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
                detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
              }
            } else {
              //detalle.importeDescuento = Math.round((detalle.subTotal * this.porcentajeDescuento) / 100);
              let unoDeTresDescuento: Descuento = await this.getDescuento('UNO_DE_TRES', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
              if (unoDeTresDescuento) {
                detalle.tipoDescuento = 'UNO_DE_TRES';
                if (detalle.cantidad >= 3) {
                  //se guarda el porcentaje de descuento
                  detalle.porcDescuento = unoDeTresDescuento.descuento;
                  // se guarda el numero de producto que tendran descuento
                  let numeroDescuentos = Math.floor(detalle.cantidad / 3);
                  // se calcula el descuento por precio
                  let descuentoPorPrecio = Math.round((detalle.importePrecio * detalle.porcDescuento) / 100);
                  // se calcula el descuento
                  detalle.importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
                  detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
                }
              } else {
                if (this.descuentoSucursalActual) {
                  detalle.tipoDescuento = 'SUCURSAL';
                } else if (this.descuentoClienteActual) {
                  detalle.tipoDescuento = 'CLIENTE';
                } else {
                  detalle.tipoDescuento = 'IMPORTE';
                }
                detalle.importeDescuento = Math.round((detalle.subTotal * this.porcentajeDescuento) / 100);
              }
            }
          }
        }
        detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
        if (this.cliente.excentoIva == false) {
          switch (detalle.porcIva) {
            case 0:
              {
                detalle.importeIva5 = 0;
                detalle.importeIva10 = 0;
                detalle.importeIvaExenta = detalle.importeTotal;
                detalle.importeNeto = detalle.importeTotal;
              }
              break;
            case 5:
              {
                detalle.importeIva5 = Math.round(detalle.importeTotal / 21);
                detalle.importeIva10 = 0;
                detalle.importeIvaExenta = 0;
                detalle.importeNeto = detalle.importeTotal - detalle.importeIva5;
              }
              break;
            case 10:
              {
                if (detalle.producto.ivaEspecial == true) {
                  detalle.importeIvaExenta = Math.round(detalle.importeTotal / 2.1);
                  let gravada = Math.round(detalle.importeIvaExenta * 1.1);
                  detalle.importeIva10 = Math.round(gravada / 11);
                  detalle.importeIva5 = 0;
                  detalle.importeNeto = detalle.importeTotal - detalle.importeIva10;
                } else {
                  detalle.importeIva10 = Math.round(detalle.importeTotal / 11);
                  detalle.importeIva5 = 0;
                  detalle.importeIvaExenta = 0;
                  detalle.importeNeto = detalle.importeTotal - detalle.importeIva10;
                }
              }
              break;
            default:
              break;
          }
        } else {
          detalle.porcIva = 0;
          detalle.importeIva5 = 0;
          detalle.importeIva10 = 0;
          detalle.importeIvaExenta = detalle.importeTotal;
          detalle.importeNeto = detalle.importeTotal;
        }

        console.log('fin detalle');
      } else {
        let index = this.pedidoDetalles.indexOf(detalle);
        this.pedidoDetalles.splice(index, 1);
        this.invalido('El producto no tiene precio');
      }
    }
    console.log('***********************Fin reHacerDetallesPorPrecio *******************');
  }

  async reHacerDetalles() {
    console.log('***********************reHacerDetalles*******************');
    for await (const detalle of this.pedidoDetalles) {
      detalle.subTotal = detalle.cantidad * detalle.importePrecio;
      detalle.porcDescuento = 0;
      detalle.importeDescuento = 0;
      if (detalle.producto.sinDescuento == false) {
        let productoDescuento: Descuento = await this.getDescuento('PRODUCTO', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
        if (productoDescuento) {
          detalle.tipoDescuento = 'PRODUCTO';
          if (productoDescuento.unidadDescuento == 'PORCENTAJE') {
            detalle.porcDescuento = productoDescuento.descuento;
            detalle.importeDescuento = Math.round((detalle.subTotal * detalle.porcDescuento) / 100);
            detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
          } else if (productoDescuento.unidadDescuento == 'IMPORTE') {
            let auxDescuento = productoDescuento.descuento * detalle.cantidad;
            detalle.porcDescuento = ((auxDescuento * 100) / detalle.subTotal);
            detalle.importeDescuento = auxDescuento;
          }

        } else {
          let unoDeDosDescuento: Descuento = await this.getDescuento('UNO_DE_DOS', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
          if (unoDeDosDescuento) {
            detalle.tipoDescuento = 'UNO_DE_DOS';
            if (detalle.cantidad >= 2) {
              //se guarda el porcentaje de descuento
              detalle.porcDescuento = unoDeDosDescuento.descuento;
              // se guarda el numero de producto que tendran descuento
              let numeroDescuentos = Math.floor(detalle.cantidad / 2);
              // se calcula el descuento por precio
              let descuentoPorPrecio = Math.round((detalle.importePrecio * detalle.porcDescuento) / 100);
              // se calcula el descuento
              detalle.importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
              detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
            }
          } else {
            //detalle.importeDescuento = Math.round((detalle.subTotal * this.porcentajeDescuento) / 100);
            let unoDeTresDescuento: Descuento = await this.getDescuento('UNO_DE_TRES', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
            if (unoDeTresDescuento) {
              detalle.tipoDescuento = 'UNO_DE_DOS';
              if (detalle.cantidad >= 3) {
                //se guarda el porcentaje de descuento
                detalle.porcDescuento = unoDeTresDescuento.descuento;
                // se guarda el numero de producto que tendran descuento
                let numeroDescuentos = Math.floor(detalle.cantidad / 3);
                // se calcula el descuento por precio
                let descuentoPorPrecio = Math.round((detalle.importePrecio * detalle.porcDescuento) / 100);
                // se calcula el descuento
                detalle.importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
                detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
              }
            } else {
              if (this.descuentoSucursalActual) {
                detalle.tipoDescuento = 'SUCURSAL';
              } else if (this.descuentoClienteActual) {
                detalle.tipoDescuento = 'CLIENTE';
              } else {
                detalle.tipoDescuento = 'IMPORTE';
              }
              detalle.importeDescuento = Math.round((detalle.subTotal * this.porcentajeDescuento) / 100);
            }
          }
        }
      }
      detalle.totalKg = detalle.cantidad * detalle.producto.peso;
      detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
      if (this.cliente.excentoIva == false) {
        switch (detalle.porcIva) {
          case 0:
            {
              detalle.importeIva5 = 0;
              detalle.importeIva10 = 0;
              detalle.importeIvaExenta = detalle.importeTotal;
              detalle.importeNeto = detalle.importeTotal;
            }
            break;
          case 5:
            {
              detalle.importeIva5 = Math.round(detalle.importeTotal / 21);
              detalle.importeIva10 = 0;
              detalle.importeIvaExenta = 0;
              detalle.importeNeto = detalle.importeTotal - detalle.importeIva5;
            }
            break;
          case 10:
            {
              if (detalle.producto.ivaEspecial == true) {
                detalle.importeIvaExenta = Math.round(detalle.importeTotal / 2.1);
                let gravada = Math.round(detalle.importeIvaExenta * 1.1);
                detalle.importeIva10 = Math.round(gravada / 11);
                detalle.importeIva5 = 0;
                detalle.importeNeto = detalle.importeTotal - detalle.importeIva10;
              } else {
                detalle.importeIva10 = Math.round(detalle.importeTotal / 11);
                detalle.importeIva5 = 0;
                detalle.importeIvaExenta = 0;
                detalle.importeNeto = detalle.importeTotal - detalle.importeIva10;
              }
            }
            break;
          default:
            break;
        }
      } else {
        detalle.porcIva = 0;
        detalle.importeIva5 = 0;
        detalle.importeIva10 = 0;
        detalle.importeIvaExenta = detalle.importeTotal;
        detalle.importeNeto = detalle.importeTotal;
      }

      console.log('fin detalle');
    }
    console.log('***********************Fin reHacerDetalles *******************');
  }

mostrarModalObservacion() {
  this.mostrarModal = true;
}
mostrarModalCanal() {
  this.modalCanal = '';
}
cerrarModalCanal() {
  this.modalCanal = 'oculto';
}

  mostrarModalCliente() {
    this.modalCliente = '';
  }

  async mostrarModalCobranza() {
    console.log(this.pedido);
    console.log(this.pedidoDetalles);
    if (!this.pedido || !this.cliente) {
      this.invalido('Pedido o cliente no puede ser nulo');
      return;
    }
    if (this.pedido) {
      if (this.pedido.importeTotal <= 0) {
        this.invalido('Pedido debe ser mayor a 0');
        return;
      }
    }
    if (this.pedido.tipoPedido == 'POS') {// no recacular pedido ecommerce
      let x = await this.reHacer();
    }
    this.medioPago.splice(0, this.medioPago.length);
    this.selectModelMedio = null;
    this.bancos = await this.getBancos();
    this.medioPago = await this.getMediosPagos();
    this.tipoMedioPago = await this.getTipoMediosPagos();
    this.pedido.cliente = this.cliente;
    if (this.cliente.formaVentaPref.esContado == true) {
      this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
      this.esContado = true;
    } else {
      this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
      this.esContado = false;
    }
    this.oculto = '';
    this.totalAbonado = 0;
    this.selectModelMedio = null;
    this.seleccionMedioPago = null;
    this.iniciarCobranza();
    this.cambioMedioPago(this.cliente.medioPagoPref.codMedioPago);
    this.cobranza.importeCobrado = Math.round(
      this.pedido.importeTotal
    );
    if (this.cobranzaAux) {
      this.cobranza = this.cobranzaAux;
      this.cobranzasDetalle = this.cobranzaAux.detalle;
      this.cobranza.importeCobrado = this.pedido.importeTotal;
      /*    this.cobranza.importeAbonado = this.pedido.importeTotal;
         this.cobranza.importeCobrado = this.pedido.importeTotal;
         this.cobranza.detalle[0].importeAbonado = this.pedido.importeTotal;
         this.cobranza.detalle[0].importeCobrado = this.pedido.importeTotal; */
      console.log(this.cobranza);
      this.totalAbonado = this.cobranzaAux.importeAbonado;
      this.vuelto = this.totalAbonado - this.cobranza.importeCobrado;
      this.cobranza.saldo = this.vuelto;
    }

    this.oculto = '';
    this.ordenarNroItem();

  }



  cerrarModal() {
    this.oculto = 'oculto';
    this.limpiar();
  }
  cancelarModal() {
    this.oculto = 'oculto';
    this.medioPago.splice(0, this.medioPago.length);
    this.tipoMedioPago.splice(0, this.tipoMedioPago.length);
    this.bancos.splice(0, this.bancos.length);
  }


  cancelarModalDetalles() {
    this.modalDetalles = 'oculto';
  }

  verificarTipoPedido() {
    if (!this.pedido.cobranza) {
      this.guardarPedido();
    } else {
      if (!this.pedido || !this.cliente) {
        this.invalido('Pedido o cliente no puede ser nulo');
        return;
      }
      if (this.pedido) {
        if (this.pedido.importeTotal <= 0) {
          this.invalido('Pedido debe ser mayor a 0');
          return;
        }
      }
      this.mostrarModalCobranza();
    }

  }

  guardarPedido() {

    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea guardar el pedido ?`,
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Guardar',
      cancelButtonText: 'No, volver al pedido',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        if (this._tieneDescuentoGrupo == true) {
          let indice = this.descuentos.indexOf(this.descuentoGrupoActual);
          this.descuentos.splice(indice, 1);
        }
        for (let i = 0; i < this.descuentos.length; i++) {
          if (this.descuentos[i]) { // cargo los descuentos
            let pedidoDescuento: PedidoDescuento;
            pedidoDescuento = {
              'codDescuento': this.descuentos[i].codDescuento,
              'codPedido': null,
              'codPedidoDescuento': null
            };
            this.pedidoDescuento.push(pedidoDescuento);
          }
        }
        this.pedido.canal = this.canal;
        this.pedido.cliente = this.cliente;
        this.pedido.porcDescuento = this.porcentajeDescuento;
        this.pedido.vendedor = this.vendedor;
        this.pedido.codVendedorErp = this.vendedor.codVendedorErp;
        this.pedido.detalle = [];
        this.pedido.detalle = this.pedidoDetalles;
        //Asegurar que la lista de precio del pedido sea igual a la del cliente
        if(this.cliente && this.cliente.listaPrecio) {
          this.pedido.listaPrecio = this.cliente.listaPrecio;
        }
        let objeto = {
          'pedido': this.pedido,
          'descuentos': this.pedidoDescuento
        };
        console.log('enviado ..', objeto);
        if (!this._modoEdicion) {
          this._pedidoServices.concretar(objeto).subscribe((resp: any) => {
            let pedido = resp.pedido as Pedido;
            Swal.fire(
              'Pedido disponible',
              `EL pedido se encuentra disponible desde el menu ventas.`,
              'success'
            );
            this.limpiar();
            this.ngOnInit();
          });
        } else {
          this._pedidoServices.update(objeto).subscribe((resp: any) => {
            let pedido = resp.pedido as Pedido;
            Swal.fire(
              'Pedido Actualizado',
              `EL pedido se encuentra disponible desde el menu ventas.`,
              'success'
            );
            this.limpiar();
            this.ngOnInit();
          });
        }
      }
    });
  }



  guardarCobranza() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    let montoCobrandoCab = this.pedido.importeTotal;
    this.cobranzasDetalle.forEach((detalleCobranza) => {
      if (montoCobrandoCab > detalleCobranza.importeAbonado) {
        detalleCobranza.importeCobrado = detalleCobranza.importeAbonado;
        montoCobrandoCab = Math.round(
          montoCobrandoCab - detalleCobranza.importeAbonado
        );
        detalleCobranza.saldo = Math.round(
          detalleCobranza.importeAbonado - detalleCobranza.importeCobrado
        );
      } else if (montoCobrandoCab == detalleCobranza.importeAbonado) {
        detalleCobranza.importeCobrado = detalleCobranza.importeAbonado;
        montoCobrandoCab = Math.round(
          montoCobrandoCab - detalleCobranza.importeAbonado
        );
        detalleCobranza.saldo = Math.round(
          detalleCobranza.importeAbonado - detalleCobranza.importeCobrado
        );
      } else if (montoCobrandoCab < detalleCobranza.importeAbonado) {
        detalleCobranza.importeCobrado = montoCobrandoCab;
        Math.round(detalleCobranza.importeAbonado - montoCobrandoCab);
        detalleCobranza.saldo = Math.round(
          detalleCobranza.importeCobrado - detalleCobranza.importeAbonado
        );
      }
    });

    if (this.cobranza.importeCobrado > this.totalAbonado) {
      this.invalido('Monto abonado menor a monto a pagar');
      return;
    }
    if (this.cobranza.importeCobrado > this.totalAbonado) {
      this.invalido('EL total de cobranza no puede ser menor a la venta');
      return;
    }
    for (let i = 0; i < this.descuentos.length; i++) {
      if (this.descuentos[i]) {
        // cargo los descuentos
        let pedidoDescuento: PedidoDescuento;
        pedidoDescuento = {
          codDescuento: this.descuentos[i].codDescuento,
          codPedido: null,
          codPedidoDescuento: null,
        };
        this.pedidoDescuento.push(pedidoDescuento);
      }
    }
    /*********      cargar cobranzas       ****** */
    this.pedido.cliente = this.cliente;
    this.cobranza.importeAbonado = this.totalAbonado;
    this.cobranza.saldo = this.cobranza.importeCobrado - this.totalAbonado;
    this.cobranza.detalle = null;
    this.cobranza.detalle = this.cobranzasDetalle;
    /*********      cargar ventas         ****** */
    this.pedido.vendedor = this.vendedor;
    this.pedido.codVendedorErp = this.vendedor.codVendedorErp;
    this.pedido.cobranza = this.cobranza;
    this.pedido.porcDescuento = this.porcentajeDescuento;
    this.pedido.detalle = null;
    this.pedido.detalle = this.pedidoDetalles;
    let objeto = {
      pedido: this.pedido,
      descuentos: this.pedidoDescuento,
    };

    console.log('enviado ..', objeto);
    if (!this._modoEdicion) {
      this._pedidoServices.concretar(objeto).subscribe((resp: any) => {
        let pedido = resp.pedido as Pedido;
        Swal.fire(
          'Pedido disponible',
          `EL pedido se encuentra disponible desde el menu ventas.`,
          'success'
        );
        this.limpiar();
        this.ngOnInit();
      });
    } else {
      this._pedidoServices.update(objeto).subscribe((resp: any) => {
        let pedido = resp.pedido as Pedido;
        Swal.fire(
          'Pedido Actualizado',
          `EL pedido se encuentra disponible desde el menu ventas.`,
          'success'
        );
        this.limpiar();
        this.ngOnInit();
      });
    }
  }


  limpiar() {
    this.nroPedido = 0;
    this.pedidoDetalleAux = null;
    this.vendedor = null;
    this._modoEdicion = false;
    console.log('LIMPIAR********************');
    this.descuentoClienteActual = null;
    this.descuentoImporteActual = null;
    this.descuentoSucursalActual = null;
    this.cobranza = null;
    this.cobranzaAux = null;
    this._importeDescontable = 0;
    this.codCobranzaDetalle = 0;
    this.oculto = 'oculto';
    this.cargando = false;
    this.paginas.length = 0;
    this.calculoTotalCantidad = 0;
    this.porcentajeDescuento = 0;
    this.limitePorcentajeDescuento = 0;
    this.porcentajeDescuento = 0;
    this.totalElementos = 0;
    this.totalAbonado = 0;
    this.cantidad = 1;
    this.montoAbonado = 0;
    this.vuelto = 0;
    this.medioPago.splice(0, this.medioPago.length);
    this.pedidoDescuento.splice(0, this.pedidoDescuento.length);
    this.pedidoDetalles.splice(0, this.pedidoDetalles.length);
    this.cobranzasDetalle.splice(0, this.cobranzasDetalle.length);
    this.descuentos.splice(0, this.descuentos.length);
    this.clientes.splice(0, this.clientes.length);
    this.productos.splice(0, this.productos.length);
    this.pedidoInit();
    this.iniciarCobranza();
    this.nroRef = '';
    this.categoriaSeleccionada = this.categoriaTodos;
    this.ngOnInit();
  }

  cerrarModalCliente() {
    this.modalCliente = 'oculto';
  }

  cerrarModalObs() {
  this.mostrarModal = false;
}
  /****************************verificar cliente******************************* */

  verificarPedido() {
    if (this.pedido.importeTotal > 0) {
      Swal.fire({
        title: 'Está seguro?',
        text: `¿Seguro que desea cambiar de cliente ?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, buscar otro cliente!',
        cancelButtonText: 'No, cancelar!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.guardarDetalles();
        }

      });
    } else {
      this.cambiarCliente();
    }
  }

  guardarDetalles() {
    let _detallesLocalStorage: PedidoDetalle[] = [] = this.pedidoDetalles;
    localStorage.setItem('detalles', window.btoa(JSON.stringify(_detallesLocalStorage)));
    this.cambiarCliente();

  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  usar(monto) {
    this.montoAbonado = monto;
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

  filtrarCategoria(categoria: CategoriaProducto) {
    if (categoria) {
      this.categoriaSeleccionada = categoria;
      this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
    } else {
      this.traerProductos(0, this.busqueda, 0);
    }
  }

  // ====================================pedido =======================================================

  cancelarModalPedidos() {
    this.nroPedido = 0;
    this.modalPedidos = 'oculto';
  }
  seleccionCliente(event: Cliente) {
    console.log(event);
    this.client = event;
  }

  editarPedido(item: Pedido) {
    if (item) {
      Swal.fire({
        title: 'Está seguro?',
        text: `¿Seguro que desea cargar este pedido ?`,
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, cargar el pedido',
        cancelButtonText: 'No, permanecer en lista de pedidos',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        reverseButtons: true,
      }).then(async (result) => {
        if (result.value) {
          this.descuentos.splice(0, this.descuentos.length);
          let modeloPedido = await this.getModelPedidosById(item.codPedido);
          console.log(modeloPedido);
          this.pedido = modeloPedido.pedido;
          this.pedido.detalle = modeloPedido.pedido.detalle;
          this.cliente = this.pedido.cliente;
          this.razonSocial = this.pedido.cliente.concatDocNombre;
          if (this.pedido.tipoPedido != 'POS') {
            console.log('Tipo Ecommerce');
            let listaPrecio = await this.getListaEcommerce();
            if (!listaPrecio) {
              this.router.navigate(['/dashboard']);
              this.invalido('Para pedidos externos es necesario la lista de tipo ecommerce');
            }
            this.listaPrecio = listaPrecio;
          } else {
            this.listaPrecio = this.cliente.listaPrecio;
            console.log('Tipo POS');
            if (!this.listaPrecio) {
              this.router.navigate(['/dashboard']);
              this.invalido('El cliente no tiene lista precio');
            }
          }
          this.pedidoDetalles = this.pedido.detalle;
          this.porcentajeDescuento = this.pedido.porcDescuento;
          for await (const descuentoPedido of modeloPedido.descuentos) {
            let descuento = await this.getDescuentoById(descuentoPedido.codDescuento);
            if (descuento) {
              if (descuento.tipoDescuento == 'IMPORTE') {
                this.descuentoImporteActual = descuento;
              } else if (descuento.tipoDescuento == 'SUCURSAL') {
                this.descuentoSucursalActual = descuento;
              } else if (descuento.tipoDescuento == 'CLIENTE') {
                this.descuentoClienteActual = descuento;
              }
              this.descuentos.push(descuento);
            }
          }
          if (this.descuentos.length == 0 && this.listaPrecio.ecommerce == true) {// pedidos ecommerce no tienen pedidoDescuentos
            if (this.pedido.importeDescuento > 0) {
              let _importeDescontable = this.pedido.subTotal - this.pedido.importeDescuento;
              let descuentoImporteNuevo: Descuento = await this.getDescuento('IMPORTE', 1, _importeDescontable, this.listaPrecio.codListaPrecio);
            }
          }
          if (this.pedido.cobranza) {
            this.cobranzaAux = this.pedido.cobranza;
          }
          this._modoEdicion = true;
          if (this.pedido.tipoPedido == 'POS') {// pedidos ecommerce no se deben recacular
            let r = await this.reHacer();
          }
          this.modalPedidos = 'oculto';

        }
      });
    }
  }

  async changeSucursal(codSucursal: number) {
    let updateUsuarioSucursal = this._loginServices.changeSucursal(codSucursal).toPromise();
    return updateUsuarioSucursal;
  }
  async cargarPaginaPedidos(page: number) {
    let p = page - 1;
    let pedidos = await this.getPedidosByFecha(p, this.fechaInicio, this.fechaFin, this.client, null, 10, 'PENDIENTE', false, 0);
    this.listaPedidos = pedidos.content;
  }
  async buscarPedido() {
    this.paginaPedido = 1;
    let pedidos = await this.getPedidosByFecha(0, this.fechaInicio, this.fechaFin, this.client, null, 10, 'PENDIENTE', false, this.nroPedido);
    this.totalElementosPed = pedidos.totalElements;
    this.pageSizePed = 10;
    this.listaPedidos = pedidos.content;
  }
  async mostrarModalPedidos() {
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechaFin = moment(new Date()).format('YYYY-MM-DD');
    this.client = null;
    if (this.pedido) {
      if (this.pedido.importeTotal > 0) {
        this.invalido('Ya existe una pedido en proceso');
        return;
      }
    }
    this.nroPedido = 0;
    this.modalPedidos = '';
    this.paginaPedido = 1;
    let pedidos = await this.getPedidosByFecha(0, this.fechaInicio, this.fechaFin, null, null, 10, 'PENDIENTE', false, 0);
    console.log(pedidos);
    this.totalElementosPed = pedidos.totalElements;
    this.pageSizePed = 10;
    this.listaPedidos = pedidos.content;
  }
  // ====================================Seccion ASYNC==================================================
  async getPedidosByFecha(page: any, fechainicio: any, fechafin: any, cliente: Cliente, usuario: Usuarios, size: number, estado: string, anulado: any, nroPedido: number) {
    let codSucursal = 0;
    if (this.user) {
      if (this.user.authorities[0] == 'ROLE_CAJERO') {
        codSucursal = this.user.codSucursal;
      }
    }
    let pedidos = this._pedidoServices.findByFecha(page, fechainicio, fechafin, cliente, usuario, codSucursal, size, estado, anulado, '',nroPedido)
      .toPromise();
    return pedidos;
  }
  async getModelPedidosById(codPedido: number) {
    let modelo = this._pedidoServices.getById(codPedido)
      .toPromise();
    return modelo;
  }
  async getBancos() {
    let bancos = this._bancosServices.traerByCodEmp(this.user.codEmpresa).toPromise();
    return bancos;
  }
  async getMediosPagos() {
    let medioPagos = this._medioPagoServices.traerMedioPago(this._loginServices.user.codEmpresa).toPromise();
    return medioPagos;
  }

  async getTipoMediosPagos() {
    let TipoMedioPagos = this._tipoMedioPagoServices.traerByCodEmp(this._loginServices.user.codEmpresa).toPromise();
    return TipoMedioPagos;
  }

  async getSucursal() {
    let sucursal = this._sucursalServices.getSucursalbyId(this._loginServices.user.codSucursal).toPromise();
    return sucursal;
  }
 async getCanales() {
    let canales = this._canalServices.traerByCodEmp(this._loginServices.user.codEmpresa).toPromise();
    return canales;
  }
  async getVendedorByCodUser() {
    let vendedor = this._vendedorServices.getByCodUser(this._loginServices.user.codUsuario).toPromise();
    return vendedor;
  }
  async ClientePredeterminado() {
    let cliente = this._clientesServices.getClienteDefault().toPromise();
    return cliente;
  }


  async getPrecio(cantidad: number, codProducto: number, codListaPrecio: number, codCliente: number) {
    let precio = this._precioServices.traerPrecio(cantidad, codProducto, codListaPrecio, codCliente).toPromise();
    return precio;
  }
  async getDescuentoById(codDescuento) {
    let descuento = this._descuentoServices
      .getDescuentoById(codDescuento).toPromise();
    return descuento;
  }

  async getDescuento(tipoDescuento: string, valor: number, cantidad: number, codListaPrecio: number) {
    let descuento = this._descuentoServices
      .getDescuento(tipoDescuento, valor, cantidad, codListaPrecio).toPromise();
    return descuento;
  }
  async getDescuentoByTipo(tipoDescuento: string, codListaPrecio: number) {
    let descuento = this._descuentoServices
      .getDescuentoByTipo(tipoDescuento, codListaPrecio).toPromise();
    return descuento;
  }

  async getListaEcommerce() {
    let listaPrecio = this._listaPrecioServices.getListEcommerce().toPromise();
    return listaPrecio;
  }

  async getCategorias() {
    let categorias = this._categoriaService.traerCategoria(this._loginServices.user.codEmpresa).toPromise();
    return categorias;
  }


  // ====================================Seccion NOTIFICACIONES==================================================
  notificacionDescuento(producto: Producto) {
    this.toastr.info(producto.nombreProducto, 'tiene descuento producto!', {
      timeOut: 150,
    });
  }
  notificacionSinDescuento(producto: Producto) {
    this.toastr.error(producto.nombreProducto, 'NO tiene descuento producto!', {
      timeOut: 150,
    });
  }

  notificacionProducto(producto: Producto) {
    this.toastr.success(producto.nombreProducto, 'se agrego nuevo producto!', {
      timeOut: 1500,
    });
  }

}
