import { Canal } from 'src/app/models/canales.model';
import { CategoriaService } from './../../services/categoria/categoria.service';
import { CategoriaProducto } from './../../models/categoriaProducto.model';
import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { Precio } from '../../models/precio.model';
import { Descuento } from '../../models/descuento.model';
import { Cliente } from '../../models/cliente.model';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductoService, ClienteService, PrecioService, DescuentoService, BancosService, VendedorService, SucursalesService, ListaPrecioService, BonificacionService, CuponService, BalanzaService } from '../../services/service.index';

import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { User } from '../../models/user.model';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { MedioPago } from '../../models/medioPago.model';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { Venta } from '../../models/venta.model';
import { FormaVenta } from '../../models/formaVenta.model';
import { Cobranza } from '../../models/cobranza.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { VentasService } from '../../services/ventas/ventas.service';
import { VentaDescuento } from '../../models/VentaDescuento.model';
import { ToastrService } from 'ngx-toastr';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { TipoMedioPagoService } from '../../services/tipoMedioPago/tipoMedioPago.service';
import { Bancos } from '../../models/bancos.model';
import { LoginService } from '../../services/service.index';
import { ErrModel } from '../../models/ErrModel.model';
import { TerminalService } from '../../services/terminales/terminales.service';
import { Terminales } from '../../models/terminales.model';
import { UUID } from 'angular2-uuid';
import { FormaVentaService } from '../../services/formaVenta/formaVenta.service';
import { PedidosService } from '../../services/pedidos/pedidos.service';
import { Pedido } from '../../models/pedido.model';
import { PedidoDetalle } from '../../models/PedidoDetalle.model';
import { DepositoService } from '../../services/deposito/deposito.service';
import { StockService } from '../../services/stock/stock.service';
import { Deposito } from '../../models/deposito.model';
import { Stock } from '../../models/stock.model';
import { ComprobantesService } from '../../services/comprobantes/comprobantes.service';
import { Comprobantes } from '../../models/comprobantes.model';
import { Vendedor } from '../../models/vendedor.model';
import { Sucursal } from '../../models/sucursal.model';
import { Usuarios } from '../../models/usuarios.model';
import { InputDebounceComponent } from '../../components/inputDebounce/inputDebounce.component';
import { AgrupadorKit } from '../../models/agrupadorKit';
import { Cupon } from 'src/app/models/cupon.model';
import { InfluencerDescuento } from '../../models/influencerDescuento.model';
import { InfluencersService } from '../../services/influencer/influencers.service';
import { DescuentoCupon } from 'src/app/models/descuentoCupon.model';
import { Influencer } from '../../models/influencer.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CanalService } from 'src/app/services/canales/canales.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
})
export class VentasComponent implements OnInit {
  /* ===========ARRAYS=================== */
  canales: Canal[] = [];
  paginas = [];
  cobranzasDetalle: CobranzaDetalle[] = [];
  tipoMedioPago: TipoMedioPago[] = [];
  formas: FormaVenta[] = [];
  medioPago: MedioPago[] = [];
  productos: Producto[] = [];
  bancos: Bancos[] = [];
  descuentos: Descuento[] = [];
  listaPedidos: Pedido[] = [];
  listasPrecio: ListaPrecio[] = [];
  ventaDescuento: VentaDescuento[] = [];
  ventaDetalles: VentaDetalle[] = [];
  pedidoDetalles: PedidoDetalle[] = [];
  detallesAux: VentaDetalle[] = [];
  clientes: Cliente[] = [];
  errores: ErrModel[] = [];
  terminales: Terminales[] = [];
  depositos: Deposito[] = [];
  categorias: CategoriaProducto[] = [];
  /* ===========objetos=================== */
  ventaDetalleAux: VentaDetalle;
  sucursal: Sucursal;
  descuentoImporteActual: Descuento;
  descuentoClienteActual: Descuento;
  descuentoSucursalActual: Descuento;
  descuentoGrupoActual: Descuento;
  deposito: Deposito;
  private terminal: Terminales;
  cobranzaPedidoAux: Cobranza;
  cobranza: Cobranza;
  productoAux: Producto;
  comprobante: Comprobantes;
  itemDescuento: Descuento;
  user: User;
  selectModelMedio: MedioPago;
  selectModelTipoMedioPago: TipoMedioPago;
  selectModelBanco: Bancos;
  selectModelCliente: Cliente;
  client: Cliente;
  cliente: Cliente;
  vendedor: Vendedor;
  listaPrecio: ListaPrecio;
  paginador: any;
  venta: Venta;
  canal: Canal;
  cuponPromo: DescuentoCupon;
  influencerDescuento: InfluencerDescuento;
  influencer: Influencer;
  formaVenta: FormaVenta;
  pedido: Pedido;
  categoriaSeleccionada: CategoriaProducto;
  categoriaTodos: CategoriaProducto = {
    'codCategoriaProducto': 0,
    'codCategoriaProductoErp': '99',
    'descripcion': 'Todos',
    'codEmpresa': this._loginServices.user.codEmpresa
  };

  /* ===========string=================== */
  fechaInicio: string;
  fechaFin: string;
  fechaEmision: string;
  fechaVencimiento: string;
  token: string;
  nroRef: string;
  influencerCupon: string;
  alertaCupon: string;
  codigoCupon: string;
  alertaInfluencerCupon: string;
  nroCuenta: string;
  oculto: string = 'oculto';
  modalCupon: string = 'oculto';
  modalInfluencer: string = 'oculto';
  modalTerminal: string = 'oculto';
  modalCliente: string = 'oculto';
  size: string = 'md';
  modalPedidos: string = 'oculto';
  modalDetalles: string = 'oculto';
  busqueda: string = '';
  rutaPaginador: string = '/ventas/page';
  razonSocial: string;
  formaVentaLabel: string;
  tamanhoPag: string = 'md';
  sinImagen: string = './assets/images/sin-imagen.jpg';
  img: string = './assets/images/jabon.png';
  /* searchModelProducto: any = ''; */
  /* ===========boolean=================== */
  balanzaConectada: boolean = false;
  tipoEcommerce: boolean = false;
  msgAdvertencia: boolean = false;
  deshabilitarBuscador: boolean = true;
  cargando: boolean = false;
  mostrarCliente: boolean = false;
  autorizado: boolean = false;
  mostraCantidad: boolean = false;
  mostrarForm: boolean = false;
  excIva: boolean = false;
  esContado: boolean = false;
  _tieneDescuentoClienteFull: boolean = false;
  _tieneDescuentoGrupo: boolean = false;
  _tieneDescuentoCliente: boolean = false;
  _tieneDescuentoSucursal: boolean = false;
  _analizarDescuentoImporte: boolean = true;
  _modoEdicion: boolean = false;
  esAdmin: boolean = false;
  /* ===========number=================== */
  limitePorcentajeDescuento: number = 0;
  seleccionTerminal: number;
  porcentajeDescuento: number = 0;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  pageSizePed: number = 0;
  totalElementosPed: number = 0;
  seleccionFormaVenta = 0;
  codCobranzaDetalle: number = 0;
  paginaPedido: number = 0;
  totalAbonado: number = 0;
  totalSaldo: number = 0;
  _importeDescontable: number = 0;
  cantidad: number = 1;
  seleccionMedioPago: number;
  montoAbonado: number = 0;
  vuelto: number = 0;
  calculoTotalCantidad: number = 0;
  nroPedido: number = 0;
  descuentoExtraInfluencer: number = 0;
  /***************mask*********** */
  @ViewChild('inputProducto') inputProducto: InputDebounceComponent;

  public ifAllowed: boolean = false;

  constructor(
    private toastr: ToastrService,
    private location: Location,
    public router: Router,
    public http: HttpClient,
    public _sucursalServices: SucursalesService,
    public _influencerServices: InfluencersService,
    public _cuponServices: CuponService,
    public _productosServices: ProductoService,
    public _vendedorServices: VendedorService,
    public _formaVentaServices: FormaVentaService,
    public _bancosServices: BancosService,
    public _comprobanteServices: ComprobantesService,
    public _terminalServices: TerminalService,
    public _clientesServices: ClienteService,
    public _precioServices: PrecioService,
    public _descuentoServices: DescuentoService,
    public _bonificacionServices: BonificacionService,
    public _loginServices: LoginService,
    public _empresaServices: EmpresasService,
    public _medioPagoServices: MedioPagoService,
    public _tipoMedioPagoServices: TipoMedioPagoService,
    private activatedRoute: ActivatedRoute,
    private _ventasServices: VentasService,
    public _pedidosServices: PedidosService,
    public _depositoServices: DepositoService,
    public _canalServices: CanalService,
    public _stockServices: StockService,
    public _listaPrecioServices: ListaPrecioService,
    public _categoriaService: CategoriaService,
    private sanitizer: DomSanitizer,
    private _balanzaService: BalanzaService,

  ) { }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event: Event) {
    this.cancelarStockComprometido(
      this.deposito.codDeposito,
      this.ventaDetalles
    );
    // this._loginServices.logout();
    this.router.navigate(['/ventas']);
    this.min();
  }

  ngOnChanges() {
    this.min();
    this.razonSocial = this.cliente.razonSocial;
  }

  async ngOnInit() {
    this.categoriaSeleccionada = this.categoriaTodos;
    this.cobranzaPedidoAux = null;
    this.tipoEcommerce = false;
    this._analizarDescuentoImporte = true;
    this._modoEdicion = false;
    this.ventaDetalleAux = null;
    this.formaVentaLabel = '';
    this.min();
    this.deshabilitarBuscador = true;
    this.router.navigate(['/ventas/page', 0]);
    this.user = this._loginServices.user;
    this.esAdmin = this.user?.authorities?.[0] === 'ROLE_ADMIN';
    this._balanzaService.verificarConexionBalanza().subscribe((resp) => this.balanzaConectada = resp);
    /*==========Observa la paginación =======================*/
    this.activatedRoute.paramMap.subscribe((params) => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
      }
      // tslint:disable-next-line:triple-equals
      if (this.autorizado == true) {
        this.traerProductos(page, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
      }
    });
    /*=====================================================*/
    console.log(this.autorizado);
    if (localStorage.getItem('tv')) {
      /***Si hay terminal se verifica si ******/
      this.terminal = JSON.parse(window.atob(localStorage.getItem('tv')));
      if (this.terminal) {
        this._terminalServices
          .getTerminalById(this.terminal.codTerminalVenta)
          .subscribe(async (terminal: Terminales) => {
            if (terminal) {
              this.autorizado = true;
              /****************Si UUI es valida************************************** */
              this.cargar(); // se llama a varios servicios para iniciar objetos empreesa,clientes, mediopago ect
              if (this.cliente) {
                /*==========Observa la paginación =======================*/
                this.activatedRoute.paramMap.subscribe((params) => {
                  let page: number = +params.get('page');
                  if (!page) {
                    page = 0;
                    this.router.navigate(['/ventas/page', 0]);
                  }
                  this.traerProductos(page, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
                });
                /*=====================================================*/
              }
              /*******************Si UUI es valida fin****************************** */
            } else if (localStorage.getItem('tv') && this.autorizado == true) {
              /***no hacer absolutamente nada */
            } else {
              Swal.fire(
                'Terminal no valida',
                `Terminal: ${this.terminal.descripcion} no valida`,
                'error'
              );
              localStorage.removeItem('tv');
              this.router.navigate(['/dashboard']);
              return;
            }
          });
      }
    } else {
      /***********Modal terminal********** */
      this._terminalServices.traerterminalesDisponibles(this.user.codEmpresa, 0).subscribe((response: any) => {
        this.terminales = response as Terminales[];
        let indice = this.terminales.findIndex((t) => t.codSucursal == this.user.codSucursal);
        this.seleccionTerminal = this.terminales[indice].codTerminalVenta;
        this.terminal = this.terminales[indice];
        this.modalTerminal = '';
        console.log(this.terminales);
        return;
      });
      /********************************** */
      console.log('else');
    }
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

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  obtenerPeso() {
    this._balanzaService.obtenerPesoBalanza().subscribe(
      (response: any) => {
        console.log(response);
        this.cantidad = +response?.peso;
        //Despues de obtener el peso, deshabilita el campo de entrada
        this.deshabilitarBuscador = false;
      },
      (error) => {
        console.error('Error al obtener el peso de la balanza');
      }
    )
  }

  // 01cargarComprobante
  // 02minimizar menu
  // 03traer cliente default
  // 04cargar forma venta
  // 05cargar descuentos

  async cargar() {
    this._listaPrecioServices.traerListaPrecio(this._loginServices.user.codEmpresa).subscribe(listaPrecio => {
      this.listasPrecio = listaPrecio;
    })

    this.comprobante = await this.getComprobanteByTerminal(this.terminal);
    this.min(); // no importa en que tiempo se ejecute
    this.porcentajeDescuento = 0;
    this.limitePorcentajeDescuento = this.user.maxDescuentoPorc;
    let deposito: Deposito = await this.getDepositoVenta();
    if (!deposito) {
      this.router.navigate(['/dashboard']);
      this.invalido('LA SUCURSAL NO POSEE UN DEPOSITO DE VENTAS');
    }
    this.deposito = deposito;
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
      this.invalido('LA SUCURSAL NO PUEDE SER NULL');
    }
    this.canales = await this.getCanales();
    if (!this.canales) {
      this.router.navigate(['/dashboard']);
      this.invalido('canal no puede ser null');
    }

    this.sucursal = sucursal;
    let vendedor: Vendedor = await this.vendedorByCodUser();
    if (!vendedor) {
      this.router.navigate(['/dashboard']);
      this.invalido('El usuario no es vendedor');
    }
    this.vendedor = vendedor;
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
    if (this.cliente.formaVentaPref.esContado == true) {
      this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
      this.esContado = true;
    } else {
      this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
      this.esContado = false;
    }
    await this.iniciarCabecera();
    this.iniciarCobranza();
    this.cargarFormaVenta(this.cliente.formaVentaPref);
    this.cambioCanal(await this.getCanalPrincipal())
    console.log('cliente DEFAULT :', this.cliente);
    this.venta.deposito = this.deposito;
    this.venta.listaPrecio = this.listaPrecio;
    let descuentoImporte: Descuento = await this.getDescuentoByTipo('IMPORTE', this.listaPrecio.codListaPrecio);
    descuentoImporte ? this._analizarDescuentoImporte = true : this._analizarDescuentoImporte = false;
    console.log('_analizarDescuentoImporte', this._analizarDescuentoImporte);
    this.descuentos.splice(0, this.descuentos.length);
    let buscarDescuentos = await this.buscarDescuentos();
    this.mostrarCliente = true;
    this.deshabilitarBuscador = false;
    this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
  }

  async buscarDescuentos() {
    if (this.cliente.grupoDescuento) {
      //si el cliente tiene grupo descuento y hay descuento sucursal se suma 10%
      let auxDescuentoFull = await this.getDescuento('CLIENTE_FULL', this.cliente.codCliente, 1, this.listaPrecio.codListaPrecio);
      if (auxDescuentoFull && auxDescuentoFull.comprasDisponibles > 0) {
        console.log('Tiene descuento de full');
        console.log(auxDescuentoFull)
        this.descuentoClienteActual = auxDescuentoFull;
        this.porcentajeDescuento = this.porcentajeDescuento + auxDescuentoFull.descuento;
        this._tieneDescuentoCliente = true;
        this.descuentos.push(auxDescuentoFull);
        console.log(this.descuentos);
        this._tieneDescuentoClienteFull = true;
        return auxDescuentoFull;
      } else {
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
      }
    } else {
      this.router.navigate(['/dashboard']);
      this.invalido('El Cliente no posee grupo descuento');
    }

  }
  async cambioCanal(canal: any) {
    if (!this.venta) {
      this.iniciarCabecera(); // inicializamos si no existe
    }
    if (canal) {
      this.canal = canal;
      this.venta.canal = canal;
    }
  }

  cargarFormaVenta(formaPref: FormaVenta) {
    this._formaVentaServices
      .traerFormaVenta(this.user.codEmpresa)
      .subscribe((forma) => {
        this.formas = forma;
        this.seleccionFormaVenta = formaPref.codFormaVenta;
        this.formaVenta = formaPref;
      });
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

  setStock(stock) {
    this._stockServices.update(stock).subscribe((res) => console.log('*********stock alterado'));
  }
  getImagenUrl(codProductoErp: string): SafeUrl {
    const imageUrl = `https://cdn.cavallaro.com.py/productos/${codProductoErp}.PNG`;
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }
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
    let stock: Stock = null;
    if (producto.inventariable == true) {
      stock = await this.getStock(producto.codProducto);
      if (!stock) {
        this.invalido('EL PRODUCTO INVENTARIABLE NO POSEE STOCK');
        return;
      }
      console.log('STOCK', stock);
    }
    let indice: number = 0;
    let precio: Precio = null;
    indice = this.ventaDetalles.findIndex((d) => d.producto.codProducto == producto.codProducto);
    // =========== ==============     si no existe en el array ==================
    if (indice == -1) {
      if (this.comprobante.maxItems <= this.ventaDetalles.length) {
        this.invalido('SE HA ALCANZADO EL LIMITE DE ITEMS POR FACTURA');
        Swal.close();
        return;
      }
      let detalleVenta: VentaDetalle;
      detalleVenta = {
        codVentaDetalle: null,
        nroItem: (this.ventaDetalles.length + 1),
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
        venta: null,
        vendedor: this.vendedor,
        codVendedorErp: this.vendedor.codVendedorErp,
        tipoDescuento: 'NINGUNO'
      };
      precio = await this.getPrecio(this.cantidad, producto.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
      if (!precio) {
        Swal.close();
        this.invalido('El producto no tiene precio');
        return;
      }
      this.ventaDetalles.push(detalleVenta);
      indice = this.ventaDetalles.findIndex((d) => d.producto.codProducto == producto.codProducto);
      this.ventaDetalles[indice].cantidad = this.ventaDetalles[indice].cantidad + this.cantidad;
      this.ventaDetalles[indice].codVendedorErp = this.vendedor.codVendedorErp;
      this.ventaDetalles[indice].vendedor = this.vendedor;
      // =========== ========================  si ya existe en el array ==================
    } else {
      this.ventaDetalles[indice].cantidad = this.ventaDetalles[indice].cantidad + this.cantidad;
      precio = await this.getPrecio(this.ventaDetalles[indice].cantidad, producto.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
    }
    /********************************************Stock************************************ */
    if (producto.inventariable == true) {
      console.log('STOCK', stock);
      let stockDisponible = stock.existencia - stock.comprometido;
      let nuevoStockComprometido = stock.comprometido;
      if (this.cantidad > stockDisponible) {
        this.ventaDetalles[indice].cantidad = this.ventaDetalles[indice].cantidad - this.cantidad;
        if (this.ventaDetalles[indice].cantidad <= 0) {
          this.ventaDetalles.splice(indice, 1);
        }
        this.cantidad = 1;
        this.invalido('El producto no tiene stock disponible');
        return;
      }
      if (this.cantidad <= stockDisponible) {
        nuevoStockComprometido = nuevoStockComprometido + this.cantidad;
        stock.comprometido = nuevoStockComprometido;
        this.setStock(stock);
      }
    }
    /********************************************Stock************************************ */
    if (precio) {
      // si el producto tiene precio
      this.ventaDetalles[indice].importePrecio = precio.precio;
      this.ventaDetalles[indice].porcIva = producto.iva;
      if (this.cliente.excentoIva == true) {
        if (this.ventaDetalles[indice].producto.iva == 0) {
          this.ventaDetalles[indice].importePrecio = precio.precio;
        } else if (this.ventaDetalles[indice].producto.iva == 5) {
          this.ventaDetalles[indice].importePrecio =
            precio.precio - Math.round(precio.precio / 21);
        } else if (this.ventaDetalles[indice].producto.iva == 10) {
          this.ventaDetalles[indice].importePrecio =
            precio.precio - Math.round(precio.precio / 11);
        }
      }
      this.ventaDetalles[indice].unidadMedida = precio.unidadMedida;
      this.ventaDetalles[indice].subTotal = Math.round(Math.round(this.ventaDetalles[indice].cantidad * this.ventaDetalles[indice].importePrecio));
      this.ventaDetalles[indice].totalKg = this.ventaDetalles[indice].cantidad * this.ventaDetalles[indice].producto.peso;
      this.ventaDetalles[indice].importeDescuento = 0;
      this.ventaDetalles[indice].porcDescuento = 0;

      /********************************************Descuentos************************************ */
      if (this.ventaDetalles[indice].producto.sinDescuento == false || this._tieneDescuentoClienteFull == true) {
        if (this._tieneDescuentoClienteFull) {//si tiene descuento Full debe afectar tanto a productos con descuento fijo o sin descuento
          this.ventaDetalles[indice].tipoDescuento = (this.cuponPromo && (this.cuponPromo?.alianza || this.cuponPromo?.influencer)) ? this.cuponPromo.cupon : 'CLIENTE_FULL';
          this.ventaDetalles[indice].porcDescuento = this.porcentajeDescuento;
          this.ventaDetalles[indice].importeDescuento = Math.round((this.ventaDetalles[indice].subTotal * this.ventaDetalles[indice].porcDescuento) / 100);
          this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].subTotal - this.ventaDetalles[indice].importeDescuento;
        } else {
          let productoDescuento: Descuento = await this.getDescuento('PRODUCTO', this.ventaDetalles[indice].producto.codProducto, this.ventaDetalles[indice].cantidad, this.listaPrecio.codListaPrecio);
          if (productoDescuento) {
            productoDescuento.descuento = productoDescuento.descuento + this.descuentoExtraInfluencer;
            this.ventaDetalles[indice].tipoDescuento = 'PRODUCTO';
            if (productoDescuento.unidadDescuento == 'PORCENTAJE') {
              this.ventaDetalles[indice].porcDescuento = productoDescuento.descuento;
              this.ventaDetalles[indice].importeDescuento = Math.round((this.ventaDetalles[indice].subTotal * this.ventaDetalles[indice].porcDescuento) / 100);
              this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].subTotal - this.ventaDetalles[indice].importeDescuento;
            } else if (productoDescuento.unidadDescuento == 'IMPORTE') {
              let auxDescuento = productoDescuento.descuento * this.ventaDetalles[indice].cantidad;
              this.ventaDetalles[indice].porcDescuento = Math.round((auxDescuento * 100) / this.ventaDetalles[indice].subTotal);
              this.ventaDetalles[indice].importeDescuento = auxDescuento;
            }
          } else {
            let unoDeDosDescuento: Descuento = await this.getDescuento('UNO_DE_DOS', this.ventaDetalles[indice].producto.codProducto, this.ventaDetalles[indice].cantidad, this.listaPrecio.codListaPrecio);
            console.log('UNO_DE_DOS', unoDeDosDescuento);
            if (unoDeDosDescuento) {
              this.ventaDetalles[indice].tipoDescuento = 'UNO_DE_DOS';
              if (this.ventaDetalles[indice].cantidad >= 2) {
                //se guarda el porcentaje de descuento
                this.ventaDetalles[indice].porcDescuento = unoDeDosDescuento.descuento;
                // se guarda el numero de producto que tendran descuento
                let numeroDescuentos = Math.floor(this.ventaDetalles[indice].cantidad / 2);
                // se calcula el descuento por precio
                let descuentoPorPrecio = Math.round((this.ventaDetalles[indice].importePrecio * this.ventaDetalles[indice].porcDescuento) / 100);
                // se calcula el descuento
                this.ventaDetalles[indice].importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
                this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].subTotal - this.ventaDetalles[indice].importeDescuento;
              }
            } else {
              //this.ventaDetalles[indice].importeDescuento = Math.round((this.ventaDetalles[indice].subTotal * this.porcentajeDescuento) / 100);
              let unoDeTresDescuento: Descuento = await this.getDescuento('UNO_DE_TRES', this.ventaDetalles[indice].producto.codProducto, this.ventaDetalles[indice].cantidad, this.listaPrecio.codListaPrecio);
              console.log('UNO_DE_TRES', unoDeTresDescuento);
              if (unoDeTresDescuento) {
                this.ventaDetalles[indice].tipoDescuento = 'UNO_DE_TRES';
                if (this.ventaDetalles[indice].cantidad >= 3) {
                  //se guarda el porcentaje de descuento
                  this.ventaDetalles[indice].porcDescuento = unoDeTresDescuento.descuento;
                  // se guarda el numero de producto que tendran descuento
                  let numeroDescuentos = Math.floor(this.ventaDetalles[indice].cantidad / 3);
                  // se calcula el descuento por precio
                  let descuentoPorPrecio = Math.round((this.ventaDetalles[indice].importePrecio * this.ventaDetalles[indice].porcDescuento) / 100);
                  // se calcula el descuento
                  this.ventaDetalles[indice].importeDescuento = Math.round(numeroDescuentos * descuentoPorPrecio);
                  this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].subTotal - this.ventaDetalles[indice].importeDescuento;
                }
              } else {
                if (this.descuentoSucursalActual) {
                  this.ventaDetalles[indice].tipoDescuento = 'SUCURSAL';
                } else if (this.descuentoClienteActual) {
                  this.ventaDetalles[indice].tipoDescuento = 'CLIENTE';
                } else {
                  if (this.cuponPromo && this.cuponPromo?.alianza || (this.cuponPromo?.influencer)) {
                    this.ventaDetalles[indice].tipoDescuento = this.cuponPromo.cupon;
                  } else {
                    this.ventaDetalles[indice].tipoDescuento = 'IMPORTE';

                  }
                }
                this.ventaDetalles[indice].importeDescuento = Math.round((this.ventaDetalles[indice].subTotal * this.porcentajeDescuento) / 100);
              }
            }
          }
        }
      }
      if (this.ventaDetalles[indice].producto.sinDescuento == true && this.descuentoExtraInfluencer > 0) {
        this.ventaDetalles[indice].porcDescuento = this.descuentoExtraInfluencer;
        this.ventaDetalles[indice].importeDescuento = Math.round((this.ventaDetalles[indice].subTotal * this.descuentoExtraInfluencer) / 100);
      }

      this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].subTotal - this.ventaDetalles[indice].importeDescuento;
      if (this.cliente.excentoIva == false) {
        switch (this.ventaDetalles[indice].porcIva) {
          case 0:
            {
              this.ventaDetalles[indice].importeIva5 = 0;
              this.ventaDetalles[indice].importeIva10 = 0;
              this.ventaDetalles[indice].importeIvaExenta = this.ventaDetalles[indice].importeTotal;
              this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal;
            }
            break;
          case 5:
            {
              this.ventaDetalles[indice].importeIva5 = Math.round(this.ventaDetalles[indice].importeTotal / 21);
              this.ventaDetalles[indice].importeIva10 = 0;
              this.ventaDetalles[indice].importeIvaExenta = 0;
              this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal - this.ventaDetalles[indice].importeIva5;
            }
            break;
          case 10:
            {
              if (this.ventaDetalles[indice].producto.ivaEspecial == true) {
                this.ventaDetalles[indice].importeIvaExenta = Math.round(this.ventaDetalles[indice].importeTotal / 2.1);
                let gravada = Math.round(this.ventaDetalles[indice].importeIvaExenta * 1.1);
                this.ventaDetalles[indice].importeIva10 = Math.round(gravada / 11);
                this.ventaDetalles[indice].importeIva5 = 0;
                this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal - this.ventaDetalles[indice].importeIva10;
              } else {
                this.ventaDetalles[indice].importeIva10 = Math.round(this.ventaDetalles[indice].importeTotal / 11);
                this.ventaDetalles[indice].importeIva5 = 0;
                this.ventaDetalles[indice].importeIvaExenta = 0;
                this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal - this.ventaDetalles[indice].importeIva10;
              }
            }
            break;
          default:
            break;
        }
      } else {
        this.ventaDetalles[indice].porcIva = 0;
        this.ventaDetalles[indice].importeIva5 = 0;
        this.ventaDetalles[indice].importeIva10 = 0;
        this.ventaDetalles[indice].importeIvaExenta = this.ventaDetalles[indice].importeTotal;
        this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal;
      }

      if (!this.ventaDetalles[indice].tipoDescuento)
        this.ventaDetalles[indice].tipoDescuento = 'NINGUNO';

      /****cambiar de ubicacion el elemento* */
      let detalleItemAux: VentaDetalle = this.ventaDetalles[indice];
      let index = this.ventaDetalles.indexOf(this.ventaDetalles[indice]);
      this.ventaDetalles.splice(index, 1);
      this.ventaDetalles.push(detalleItemAux); /// insertar
      /******************* */

      this.notificacionProducto(this.ventaDetalles[indice].producto);
      let x = await this.reHacerVenta();
      this.busqueda = '';
      // $('#inputDebounce').val('');
      this.cantidad = 1;
      if (this.inputProducto) {
        this.inputProducto.inputValue = '';
        this.inputProducto.enfocar();
      }
      Swal.close();
      return true;
    } else {
      this.invalido('El producto no tiene precio');
      if (this.inputProducto) {
        this.inputProducto.inputValue = '';
        this.inputProducto.enfocar();
      }
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
    let deposito: Deposito = await this.getDepositoVenta();
    if (!deposito) {
      this.router.navigate(['/dashboard']);
      this.invalido('LA SUCURSAL NO POSEE UN DEPOSITO DE VENTAS');
    }
    this.deposito = deposito;
    this.iniciarCabecera(); // no importa en que tiempo se ejecute mientras exista cliente default
    this.iniciarCobranza(); // no importa en que tiempo se ejecute mientras exista cliente default
    this.cliente = item;
    console.log(item);
    if (this.cliente.predeterminado == false) {
      if (this.cliente.email == '' || this.cliente.email == null) {
        this.router.navigate(['/clientes/formulario/', this.cliente.codCliente]);
        this.invalido('Cliente no posee email');
        return;
      }
    }
    if (this.cliente) {
      this.razonSocial = this.cliente.concatDocNombre;
      this.listaPrecio = this.cliente.listaPrecio;
      this.venta.listaPrecio = this.cliente.listaPrecio;
      if (this.tipoEcommerce == true) {
        console.log('TIPO ECOMMERCE');
        this.listaPrecio = await this.getListaEcommerce();
      }
      let categorias = await this.getCategorias();
      if (!categorias) {
        this.router.navigate(['/dashboard']);
        this.invalido('No existen categorias');
      }

      this.categorias = categorias;
      console.log(this.categorias);
      this.categorias.unshift(this.categoriaTodos);
      if (!this.listaPrecio) {
        this.router.navigate(['/dashboard']);
        this.invalido('No existe lista de precio');
      }
      if (this.cliente.formaVentaPref.esContado == true) {
        this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
        this.esContado = true;
      } else {
        this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
        this.esContado = false;
      }
      this.cargarFormaVenta(this.cliente.formaVentaPref); // no importa en que tiempo se ejecute mientras exista cliente default
      let descuentoImporte: Descuento = await this.getDescuentoByTipo('IMPORTE', this.listaPrecio.codListaPrecio);
      descuentoImporte ? this._analizarDescuentoImporte = true : this._analizarDescuentoImporte = false;
      console.log('_analizarDescuentoImporte', this._analizarDescuentoImporte);
      if (this.tipoEcommerce == false) {
        let buscarDescuentos: any = await this.buscarDescuentos();
      } else {
        console.log('Modo ecomerce de descuento');
        this.descuentos.splice(0, this.descuentos.length);
      }
      this.mostrarCliente = true;
      this.deshabilitarBuscador = false;
      this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
      /***Si existe en el localStorage ******/
      if (localStorage.getItem('detalles')) {
        if (this.tipoEcommerce == false) {
          this.ventaDetalles = JSON.parse(window.atob(localStorage.getItem('detalles')));
          let a = await this.reHacerDetallesPorPrecio(false);
          let b = await this.reHacerVenta();
          localStorage.removeItem('detalles');
        } else {
          this.venta = JSON.parse(window.atob(localStorage.getItem('ventaPedido')));
          this.ventaDetalles = this.venta.detalle;
          this.porcentajeDescuento = this.pedido.porcDescuento;
          if (this.descuentos.length == 0 && this.listaPrecio.ecommerce == true) {// pedidos ecommerce no tienen pedidoDescuentos
            if (this.venta.cupon && this.venta.cupon.length >= 8) {
              let cuponVenta: Cupon = await this.buscarCupon(this.venta.cupon);
              this._tieneDescuentoGrupo = false;
              this._tieneDescuentoSucursal = false;
              this._tieneDescuentoCliente = true;
              this._tieneDescuentoClienteFull = true;
              let descuentoCupon: Descuento = {
                codDescuento: 0,
                descripcion: cuponVenta.cupon,
                codDescuentoErp: '',
                codEmpresa: this.user.codSucursal,
                codSucursal: this.user.codSucursal,
                listaPrecio: this.listaPrecio,
                tipoDescuento: 'CUPON',
                unidadDescuento: 'PORCENTAJE',
                fechaDesde: new Date(),
                fechaHasta: new Date(),
                producto: null,
                cliente: null,
                medioPago: null,
                descuento: cuponVenta.descuento,
                cantDesde: 0,
                cantHasta: 99999999,
                activo: true,
              }
              this.descuentos.push(descuentoCupon);
            } else {
              this.descuentos = [];
              this.descuentos.splice(0, this.descuentos.length);
              this._tieneDescuentoSucursal = false;
              this._tieneDescuentoGrupo = false;
              this._tieneDescuentoCliente = false;
              this._analizarDescuentoImporte = true;
              let ventaDetallesDescontables: VentaDetalle[] = this.ventaDetalles.filter(d => d.porcDescuento == 0);
              this._importeDescontable = ventaDetallesDescontables.reduce((accumulator, detalle) => accumulator + detalle.subTotal, 0);
              let descuentoImporteNuevo: Descuento = await this.getDescuento('IMPORTE', 1, this._importeDescontable, this.listaPrecio.codListaPrecio);
              if (descuentoImporteNuevo) {
                this.descuentos.push(descuentoImporteNuevo);
              }
            }
          }
        }

      }
      if (this.pedidoDetalles.length > 0 && this.tipoEcommerce == false) {
        /***Si existe pedido ******/
        console.log(' /***Si existe pedido ******/');
        let a = await this.reHacerDetallesPorPrecio(true);
        let b = await this.reHacerVenta();
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
    this.ventaDescuento.splice(0, this.ventaDescuento.length);
    this.ventaDetalles.splice(0, this.ventaDetalles.length);
    this.cobranzasDetalle.splice(0, this.cobranzasDetalle.length);
    this.descuentos.splice(0, this.descuentos.length);
    this.descuentoImporteActual = null;
    this.clientes.splice(0, this.clientes.length);
    this.productos.splice(0, this.productos.length);
    this.nroRef = '';
    $('#typeahead-http').val('');
    this.mostrarCliente = false;
    this.iniciarCabecera();
    this.iniciarCobranza();
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
    let x = await this.reHacerVenta();
  }

  async quitarProductoCompleto(item: VentaDetalle) {
    /********************************************Stock************************************ */
    let stock: Stock = null;
    if (item.producto.inventariable == true) {
      stock = await this.getStock(item.producto.codProducto);
      if (!stock) {
        this.invalido(+item.producto.nombreProducto + ' INVENTARIABLE NO POSEE STOCK ');
        return;
      }
      console.log('STOCK', stock);
      let nuevoStockComprometido = stock.comprometido - item.cantidad;
      stock.comprometido = nuevoStockComprometido;
      this.setStock(stock);
    }
    /********************************************Stock************************************ */
    let indice = this.descuentos.findIndex((d) => d.tipoDescuento == 'PRODUCTO' && d.producto.codProducto == item.producto.codProducto);
    if (indice > -1) {
      this.porcentajeDescuento =
        this.porcentajeDescuento - this.descuentos[indice].descuento;
      this.descuentos.splice(indice, 1);
      let index = this.ventaDetalles.indexOf(item);
      this.ventaDetalles.splice(index, 1);
    } else {
      let index = this.ventaDetalles.indexOf(item);
      this.ventaDetalles.splice(index, 1);
    }
    this._importeDescontable = 0;
    let w = await this.reHacerDetallesPorPrecio(false);
    let x = await this.reHacerVenta();
    this.ordenarNroItem();
  }

  ordenarNroItem() {
    for (let i = 0; i < this.ventaDetalles.length; i++) {
      this.ventaDetalles[i].nroItem = i + 1;
    }
  }
  cambioCliente(value: Cliente) {
    console.log(this.clientes);
    this.iniciarCabecera();
    console.log(this.venta);
    this.cargarProductos();
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

    //Validacion de nroRef para medios de pago que requiera
    if (this.selectModelMedio && this.selectModelMedio.tieneRef && this.nroRef) {
      //const desc = this.selectModelMedio.descripcion.toUpperCase();
      //Detecta si el medio de pago es una transferencia
      //if(desc.includes('TRANSF.ITAU') || desc.includes('TRANSF.GNB') || desc.includes('TRANSF.SUDAMERIS') || desc.includes('TRANSF.EXPRESS')) {
      if (this.nroRef.length < 10) {
        this.nroRef = this.nroRef.padStart(10, '0');
        console.log('Nro referencia completada con ceros:', this.nroRef);
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
      //Si es tarjeta (cod = 2) no se combina, sigue al siguiente
      if (detalleCobranza.medioPago.codMedioPagoErp === '2') {
        bandera = true;
        continue;
      }
      if (
        this.cobranzasDetalle[indice].medioPago.codMedioPago ===
        detalleCobranza.medioPago.codMedioPago
      ) {
        console.log('existe.. entonces se aumenta');
        this.cobranzasDetalle[indice].importeAbonado =
          this.cobranzasDetalle[indice].importeAbonado +
          detalleCobranza.importeAbonado;
        this.cobranzasDetalle[indice].importeCobrado =
          this.cobranzasDetalle[indice].importeCobrado +
          detalleCobranza.importeCobrado;
        this.cobranzasDetalle[indice].saldo =
          this.cobranzasDetalle[indice].saldo + detalleCobranza.saldo;
        this.totalAbonado += detalleCobranza.importeAbonado;
        this.cobranza.importeCobrado = Math.round(this.venta.importeTotal);
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
      this.cobranza.importeCobrado = Math.round(this.venta.importeTotal);
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
    this.router.navigate(['/ventas/page', 0]);
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

  traerProductos(page, termino, codCategoria) {
    this._productosServices
      .traerProductosActivosPorPaginas(page, termino, codCategoria)
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
          if (this.inputProducto) {
            this.inputProducto.inputValue = '';
            this.inputProducto.enfocar();
          }
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

  async restarProducto(item: VentaDetalle) {
    if (item.cantidad === 1) {
      // == Si existe un solo producto
      return;
    } else if (item.cantidad > 1) {
      /********************************************Stock************************************ */
      let stock: Stock = null;
      if (item.producto.inventariable == true) {
        stock = await this.getStock(item.producto.codProducto);
        if (!stock) {
          this.invalido(+item.producto.nombreProducto + ' INVENTARIABLE NO POSEE STOCK ');
          return;
        }
        console.log('STOCK', stock);
        let nuevoStockComprometido = stock.comprometido;
        nuevoStockComprometido = nuevoStockComprometido - 1;
        stock.comprometido = nuevoStockComprometido;
        this.setStock(stock);
        console.log('STOCK', stock);
      } // == Si existe mas de un solo producto
      /********************************************Stock************************************ */
      let indice = this.ventaDetalles.indexOf(item); // traer indice
      this.ventaDetalles[indice].cantidad = this.ventaDetalles[indice].cantidad - 1;
      let w = await this.reHacerDetallesPorPrecio(false);
      let x = await this.reHacerVenta();
    }
  }

  async reHacerVenta() {
    const a = await this.reHacerTotal();
    const b = await this.calcularDescuentoImporte().then(() => console.log('Termino calcularDescuentoImporte'));
    const c = await this.reHacerDetalles();
    const d = await this.reHacerTotal();
  }

  calcularDescuentoImporte(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (this._analizarDescuentoImporte == true && this._tieneDescuentoSucursal == false && this._tieneDescuentoCliente == false && this._tieneDescuentoGrupo == false) {
        console.log('_importeDescontable', this._importeDescontable);
        let descuentoImporteNuevo: Descuento = await this.getDescuento('IMPORTE', 1, this._importeDescontable, this.listaPrecio.codListaPrecio);
        if (descuentoImporteNuevo) {
          descuentoImporteNuevo.descuento = descuentoImporteNuevo.descuento + this.descuentoExtraInfluencer;
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
    this.venta.importeDescuento = 0;
    this.venta.importeTotal = 0;
    this._importeDescontable = 0;
    this.venta.importeNeto = 0;
    this.venta.subTotal = 0;
    this.venta.importeIvaExenta = 0;
    this.venta.importeIva5 = 0;
    this.venta.importeIva10 = 0;
    this.venta.totalKg = 0;
    this.venta.descuentoProducto = 0;

    console.log('***********************reHacerTotal*******************');
    for await (const detalle of this.ventaDetalles) {
      this.calculoTotalCantidad = this.calculoTotalCantidad + detalle.cantidad;
      this.venta.subTotal = this.venta.subTotal + detalle.subTotal;
      this.venta.importeIva5 = this.venta.importeIva5 + detalle.importeIva5;
      this.venta.importeIva10 = this.venta.importeIva10 + detalle.importeIva10;
      this.venta.importeIvaExenta = this.venta.importeIvaExenta + detalle.importeIvaExenta;
      if (detalle.producto.sinDescuento == false || this._tieneDescuentoClienteFull == true) {
        if (detalle.porcDescuento == 0) {
          this._importeDescontable = this._importeDescontable + detalle.subTotal;
          this.venta.importeDescuento = this.venta.importeDescuento + detalle.importeDescuento;
        } else {
          if (this._tieneDescuentoClienteFull == true) {
            this._importeDescontable = this._importeDescontable + detalle.subTotal;
            this.venta.importeDescuento = this.venta.importeDescuento + detalle.importeDescuento;
          } else {
            this.venta.importeDescuento = this.venta.importeDescuento + 0;
          }
        }

        if (detalle.tipoDescuento == 'PRODUCTO' || detalle.tipoDescuento == 'UNO_DE_DOS' || detalle.tipoDescuento == 'UNO_DE_TRES') {
          this.venta.descuentoProducto = this.venta.descuentoProducto + detalle.importeDescuento;
        }

      } else {
        if (this.descuentoExtraInfluencer > 0) {
          detalle.porcDescuento = this.descuentoExtraInfluencer;
          detalle.importeDescuento = Math.round((detalle.subTotal * this.descuentoExtraInfluencer) / 100);
        } else {
          detalle.importeDescuento = 0;
          this.venta.importeDescuento = this.venta.importeDescuento + detalle.importeDescuento;
        }
      }
      this.venta.totalKg = this.venta.totalKg + detalle.totalKg;
      this.venta.importeNeto = this.venta.importeNeto + detalle.importeNeto;
      this.venta.importeTotal = this.venta.importeTotal + detalle.importeTotal;

      console.log('fin vuelta total');
    }
    console.log('***********************Fin reHacerTotal *******************');
  }


  async reHacerDetallesPorPrecio(_verificarStock: boolean) {
    console.log('***********************reHacerDetallesPorPrecio*******************');
    for await (const detalle of this.ventaDetalles) {
      let precio = await this.getPrecio(detalle.cantidad, detalle.producto.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
      if (precio) {
        if (_verificarStock) {
          /********************************************Stock************************************ */
          let stock: Stock = null;
          if (detalle.producto.inventariable == true) {
            stock = await this.getStock(detalle.producto.codProducto);
            if (!stock) {
              this.invalido(+detalle.producto.nombreProducto +
                ' INVENTARIABLE NO POSEE STOCK '
              );
              return;
            }
            console.log('STOCK', stock);
            let stockDisponible = stock.existencia - stock.comprometido;
            let nuevoStockComprometido = stock.comprometido;
            if (this.cantidad <= stockDisponible) {
              nuevoStockComprometido = nuevoStockComprometido + detalle.cantidad;
              stock.comprometido = nuevoStockComprometido;
              this.setStock(stock);
              console.log('STOCK', stock);
            }
            if (this.cantidad > stockDisponible) {
              this.cantidad = 1;
              this.invalido('El producto no tiene stock disponible');
              return;
            }
          }
          /********************************************Stock************************************ */
        }
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
        detalle.subTotal = Math.round(detalle.cantidad * detalle.importePrecio);
        detalle.totalKg = detalle.cantidad * detalle.producto.peso;
        detalle.porcDescuento = 0;
        detalle.importeDescuento = 0;
        if (detalle.producto.sinDescuento == false || this._tieneDescuentoClienteFull == true) {
          if (this._tieneDescuentoClienteFull) {//si tiene descuento Full debe afectar tanto a productos con descuento fijo o sin descuento
            detalle.porcDescuento = this.porcentajeDescuento;
            detalle.importeDescuento = Math.round((detalle.subTotal * detalle.porcDescuento) / 100);
            detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
          } else {
            let productoDescuento: Descuento = await this.getDescuento('PRODUCTO', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
            if (productoDescuento) {
              productoDescuento.descuento = productoDescuento.descuento + this.descuentoExtraInfluencer;
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
                    if (this.cuponPromo && this.cuponPromo?.alianza || (this.cuponPromo?.influencer)) {
                      detalle.tipoDescuento = this.cuponPromo.cupon;
                    } else {
                      detalle.tipoDescuento = 'IMPORTE';
                    }
                  }
                  detalle.importeDescuento = Math.round((detalle.subTotal * this.porcentajeDescuento) / 100);
                }
              }
            }
          }
        }
        if (detalle.producto.sinDescuento == true && this.descuentoExtraInfluencer > 0) {
          detalle.porcDescuento = this.descuentoExtraInfluencer;
          detalle.importeDescuento = Math.round((detalle.subTotal * this.descuentoExtraInfluencer) / 100);
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
        if (!detalle.tipoDescuento)
          detalle.tipoDescuento = 'NINGUNO';

        console.log('fin detalle');
      } else {
        this.invalido('El producto no tiene precio');
      }
    }
    console.log('***********************Fin reHacerDetallesPorPrecio *******************');
  }

  async reHacerDetalles() {
    console.log('***********************reHacerDetalles*******************');
    for await (const detalle of this.ventaDetalles) {
      if (detalle.tipoDescuento != 'BONIF_PRODUCTO' && detalle.tipoDescuento != 'BONIF_CLN-PRODUCTO' && detalle.tipoDescuento != 'BONIF_KIT' && detalle.tipoDescuento != 'BONIF_CLN-KIT') {
        detalle.subTotal = Math.round(detalle.cantidad * detalle.importePrecio);
        detalle.totalKg = detalle.cantidad * detalle.producto.peso;
        detalle.porcDescuento = 0;
        detalle.importeDescuento = 0;
        if (detalle.producto.sinDescuento == false || this._tieneDescuentoClienteFull == true) {
          if (this._tieneDescuentoClienteFull) {//si tiene descuento Full debe afectar tanto a productos con descuento fijo o sin descuento
            detalle.porcDescuento = this.porcentajeDescuento;
            detalle.importeDescuento = Math.round((detalle.subTotal * detalle.porcDescuento) / 100);
            detalle.importeTotal = detalle.subTotal - detalle.importeDescuento;
          } else {
            let productoDescuento: Descuento = await this.getDescuento('PRODUCTO', detalle.producto.codProducto, detalle.cantidad, this.listaPrecio.codListaPrecio);
            if (productoDescuento) {
              productoDescuento.descuento = productoDescuento.descuento + this.descuentoExtraInfluencer;
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
                    if (this.cuponPromo && this.cuponPromo?.alianza || (this.cuponPromo?.influencer)) {
                      detalle.tipoDescuento = this.cuponPromo.cupon;
                    } else {
                      detalle.tipoDescuento = 'IMPORTE';

                    }
                  }
                  detalle.importeDescuento = Math.round((detalle.subTotal * this.porcentajeDescuento) / 100);
                }
              }
            }
          }
        }
        if (detalle.producto.sinDescuento == true && this.descuentoExtraInfluencer > 0) {
          detalle.porcDescuento = this.descuentoExtraInfluencer;
          detalle.importeDescuento = Math.round((detalle.subTotal * this.descuentoExtraInfluencer) / 100);
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
      }
      if (!detalle.tipoDescuento)
        detalle.tipoDescuento = 'NINGUNO';
      console.log('fin detalle');
    }
    console.log('***********************Fin reHacerDetalles *******************');
  }


  mostrarModalCliente() {
    this.modalCliente = '';
  }

  mostrarModalInfluencer() {
    this.modalInfluencer = '';
  }
  async validarInFluencerCupon() {
    this.cuponPromo = null;
    this.alertaInfluencerCupon = ''
    this.influencerDescuento = await this.obtenerDescuentoInflCupon(this.influencerCupon.toUpperCase());
    this.influencer = (this.influencerDescuento && this.influencerDescuento.influencer) ? this.influencerDescuento.influencer : null;
    console.log(this.influencer)
    console.log(this.influencerDescuento)
    if (this.influencerDescuento.cantValidez == 0 || !this.influencer) {
      this.alertaInfluencerCupon = 'Codigo de cupon no es valido !!!';
      return;
    }
    if (this.cliente.predeterminado == true || this.cliente.esPropietario == true || this.cliente.listaPrecio.codListaPrecio == 2) {
      this.alertaInfluencerCupon = 'No se puede aplicar cupon a funcionario o cliente mostrador';
      return;
    }
    if (this.alertaInfluencerCupon == '' && this.influencerDescuento?.influencer) {
      this.alertaInfluencerCupon = 'Codigo de influencer valido';
      this.cuponPromo = new DescuentoCupon();
      this.cuponPromo.influencer = this.influencer;
      this.cuponPromo.cupon = this.influencer.cupon;
      this.cuponPromo.descuento = this.influencer.descuento;
    }
  }

  async usarInfluencerCupon() {
    this.influencerCupon = '';
    this.alertaInfluencerCupon = '';
    this.modalInfluencer = 'oculto';
    console.log('usarInfluencerCupon');
    this.venta.cupon = this.cuponPromo.cupon;
    this.descuentoExtraInfluencer = this.cuponPromo.descuento;
    //this.descuentos.splice(0, this.descuentos.length);
    if (this.ventaDetalles?.length >= 1) {
      let x = await this.reHacerVenta();
    }

  }

  mostrarModalCupon() {
    this.modalCupon = '';
  }
  async validarCupon() {
    this.cuponPromo = null;
    this.alertaCupon = ''
    let cupon: Cupon = await this.buscarCupon(this.codigoCupon);
    if (!cupon) {
      this.alertaCupon = 'Codigo de cupon no valido !!!';
    }
    if (cupon) {
      if (cupon.activo == false) {
        this.alertaCupon = 'El culpon fue utilizado por ' + cupon.nroDocUs + ' ' + cupon.razonSocialUs;
      }
      if (moment(cupon.fechaVencimiento).format('YYYY-MM-DD') < moment(new Date()).format('YYYY-MM-DD')) {
        this.alertaCupon = 'El culpon esta vencido !!!';
      }
      if (this.cliente.predeterminado == true || this.cliente.esPropietario == true || this.cliente.listaPrecio.codListaPrecio == 2) {
        this.alertaCupon = 'No se puede aplicar cupon a funcionario o cliente mostrador';
      }
    }
    if (this.alertaCupon == '') {
      this.alertaCupon = 'Cupon valido';
      this.cuponPromo = new DescuentoCupon();
      this.cuponPromo.alianza = cupon.alianza;
      this.cuponPromo.cupon = cupon.cupon;
      this.cuponPromo.descuento = cupon.descuento;
    }
  }
  async usarCupon() {
    this.descuentos.splice(0, this.descuentos.length);
    this.alertaCupon = '';
    this.modalCupon = 'oculto';
    console.log('USANDO CUPON');
    let descuentoCupon: Descuento = {
      codDescuento: 0,
      descripcion: this.cuponPromo.cupon,
      codDescuentoErp: '',
      codEmpresa: this.user.codSucursal,
      codSucursal: this.user.codSucursal,
      listaPrecio: this.listaPrecio,
      tipoDescuento: 'CUPON',
      unidadDescuento: 'PORCENTAJE',
      fechaDesde: new Date(),
      fechaHasta: new Date(),
      producto: null,
      cliente: null,
      medioPago: null,
      descuento: this.cuponPromo.descuento,
      cantDesde: 0,
      cantHasta: 99999999,
      activo: true,

    }
    this.venta.cupon = this.cuponPromo.cupon;
    this.porcentajeDescuento = this.cuponPromo.descuento;
    this._tieneDescuentoGrupo = false;
    this._tieneDescuentoSucursal = false;
    this._tieneDescuentoCliente = true;
    this._tieneDescuentoClienteFull = true;
    this.descuentos.push(descuentoCupon);
    let x = await this.reHacerVenta();
  }

  ocultarModalCupon() {
    this.cuponPromo = null;
    this.alertaCupon = '';
    this.modalCupon = 'oculto';
  }
  ocultarModalInfluencer() {
    this.influencerCupon = '';
    this.cuponPromo = null;
    this.alertaInfluencerCupon = '';
    this.modalInfluencer = 'oculto';
  }


  async mostrarModal() {
    console.log(this.venta);
    console.log(this.ventaDetalles);
    if (!this.venta || !this.cliente) {
      this.invalido('Venta o cliente no puede ser nulo');
      return;
    }
    if (this.venta) {
      if (this.venta.importeTotal <= 0) {
        this.invalido('Venta debe ser mayor a 0');
        return;
      }
    }
    if (this.tipoEcommerce == false) {
      let x = await this.reHacerVenta();
    }
    this.medioPago.splice(0, this.medioPago.length);
    this.selectModelMedio = null;
    this.bancos = await this.getBancos();
    this.medioPago = await this.getMediosPagos();
    this.tipoMedioPago = await this.getTipoMediosPagos();
    this.venta.cliente = this.cliente;
    if (this.cliente.formaVentaPref.esContado == true) {
      this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
      this.esContado = true;
    } else {
      this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
      this.esContado = false;
    }
    this.venta.formaVenta = this.cliente.formaVentaPref;
    this.oculto = '';
    this.totalAbonado = 0;
    this.selectModelMedio = null;
    this.seleccionMedioPago = null;
    this.iniciarCobranza();
    this.cambioMedioPago(this.cliente.medioPagoPref.codMedioPago);
    this.cobranza.importeCobrado = Math.round(
      this.venta.importeTotal
    );

    // if (this.listaPrecio && this.listaPrecio.codListaPrecio == 2) {
    //   this.venta.codVendedorErp = '0026';
    // }

    if (this.cobranzaPedidoAux) {
      this.cobranza = this.cobranzaPedidoAux;
      this.cobranzasDetalle = this.cobranzaPedidoAux.detalle;
      this.cobranza.importeCobrado = this.venta.importeTotal;
      this.cobranza.tipo = 'VENTA';
      console.log(this.cobranza);
      this.totalAbonado = this.cobranzaPedidoAux.importeAbonado;
      this.vuelto = this.totalAbonado - this.cobranza.importeCobrado;
      this.cobranza.saldo = this.vuelto;
      if (this.tipoEcommerce == true && this.cobranzasDetalle[0].importeCobrado == 0) {
        this.cobranzasDetalle[0].importeAbonado = this.cobranza.importeCobrado;
        this.cobranzasDetalle[0].importeCobrado = this.cobranza.importeCobrado;
        this.cobranza.importeAbonado = this.cobranza.importeCobrado;
        this.totalAbonado = this.cobranza.importeCobrado;
      }
      /*
           this.cobranza = this.cobranzaPedidoAux;
           this.cobranzasDetalle = this.cobranzaPedidoAux.detalle;
           this.cobranza.importeAbonado = this.venta.importeTotal;
           this.cobranza.importeCobrado = this.venta.importeTotal;
           this.totalAbonado = this.venta.importeTotal;
           this.cobranzasDetalle[0].importeAbonado = this.venta.importeTotal;
           this.cobranzasDetalle[0].importeCobrado = this.venta.importeTotal;
           this.cobranzasDetalle[0].saldo = 0; */
    }


    this.oculto = '';
    this.ordenarNroItem();

  }

  seleccionarPedido(item: Pedido) {
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
      }).then((result) => {
        if (result.value) {
          this._pedidosServices
            .getById(item.codPedido)
            .subscribe(async (respuesta: any) => {
              console.log('seleccionar pedidos');
              console.log(respuesta);
              console.log(this.pedido);
              this.pedido = respuesta.pedido;
              this.initDescuentos();
              let detallePedido = this.pedido.detalle;
              this.pedidoDetalles = this.pedido.detalle;
              this.cliente = this.pedido.cliente;
              this.razonSocial = this.cliente.concatDocNombre;
              this.mostrarCliente = true;
              this.deshabilitarBuscador = false;
              this.venta.cliente = this.cliente;
              if (this.cliente.formaVentaPref.esContado == true) {
                this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
                this.esContado = true;
              } else {
                this.formaVentaLabel = this.cliente.formaVentaPref.descripcion;
                this.esContado = false;
              }
              this.cargarFormaVenta(this.cliente.formaVentaPref);
              console.log('CLIENTE:');
              console.log(this.cliente);
              console.log('canal***********************', this.pedido.canal);
              /**cargar cabecera */
              this.canal = this.pedido.canal;
              this.venta.canal = this.pedido.canal;
              this.venta.importeIva10 = this.pedido.importeIva10;
              this.venta.importeIvaExenta = this.pedido.importeIvaExenta;
              this.venta.importeIva5 = this.pedido.importeIva5;
              this.venta.porcDescuento = this.pedido.porcDescuento;
              this.venta.importeDescuento = this.pedido.importeDescuento;
              this.venta.importeNeto = this.pedido.importeNeto;
              this.venta.importeTotal = this.pedido.importeTotal;
              this.venta.subTotal = this.pedido.subTotal;
              this.venta.totalKg = this.pedido.totalKg;
              this.venta.importeTotal = this.pedido.importeTotal;
              this.venta.cliente = this.pedido.cliente;
              this.venta.codVendedorErp = this.venta.vendedor.codVendedorErp;
              this.venta.cupon = this.pedido.cupon;
              this.venta.modoEntrega = this.pedido.modoEntrega.toUpperCase();
              this.venta.pedido = this.pedido;
              this.venta.cobranza = this.pedido.cobranza;
              if (this.pedido.vendedor.tipo == 'ECOMMERCE') {
                this.vendedor = await this.vendedorByCodUser();
              } else {
                this.vendedor = this.pedido.vendedor;
              }
              this.venta.vendedor = this.vendedor;
              this.venta.codVendedorErp = this.vendedor.codVendedorErp;
              this.venta.listaPrecio = this.pedido.listaPrecio;
              this.listaPrecio = this.venta.listaPrecio;
              this.venta.porcDescuento = this.pedido.porcDescuento;

              if (this.pedido.cobranza) {
                this.cobranzaPedidoAux = this.pedido.cobranza;
                this.venta.cobranza = this.pedido.cobranza;
                //Normalizar nroRef si la cobranza tiene detalles con referencia
                if (this.venta.cobranza.detalle && this.venta.cobranza.detalle.length > 0) {
                  this.venta.cobranza.detalle.forEach((detalle: any) => {
                    if (detalle.medioPago?.tieneRef && detalle.nroRef && detalle.nroRef.length < 10) {
                      detalle.nroRef = detalle.nroRef.padStart(10, '0');
                      console.log('NroRef normalizado para pedido ecommerce:', detalle.nroRef);
                    }
                  });
                }
              }
              if (this.pedido.tipoPedido == 'POS') {
                this.tipoEcommerce = false;
                this.venta.tipoVenta = 'POS';
              } else {
                this.tipoEcommerce = true;
                this.venta.tipoVenta = 'ECOMMERCE';
              }

              if (respuesta.descuentos) {
                for await (const descuentoPedido of respuesta.descuentos) {
                  let descuento = await this.getDescuentoById(descuentoPedido.codDescuento);
                  if (descuento) {
                    if (descuento.tipoDescuento == 'IMPORTE') {
                      this.descuentoImporteActual = descuento;
                      this._analizarDescuentoImporte = true
                    } else if (descuento.tipoDescuento == 'SUCURSAL') {
                      this._tieneDescuentoSucursal = true;
                      this._analizarDescuentoImporte = false;
                      this.descuentoSucursalActual = descuento;
                    } else if (descuento.tipoDescuento == 'CLIENTE') {
                      this._analizarDescuentoImporte = false;
                      this._tieneDescuentoCliente = true;
                      this.descuentoClienteActual = descuento;
                    }
                    this.descuentos.push(descuento);
                  }
                }
              } console.log('DESCUENTOS:');
              console.log(this.descuentos);
              this.porcentajeDescuento = this.pedido.porcDescuento;
              this.limitePorcentajeDescuento = this.user.maxDescuentoPorc;
              /**cargar detalles */
              for (let index = 0; index < detallePedido.length; index++) {
                let detalleVenta: VentaDetalle;
                detalleVenta = {
                  codVentaDetalle: null,
                  nroItem: detallePedido[index].nroItem,
                  cantidad: detallePedido[index].cantidad,
                  importeDescuento: detallePedido[index].importeDescuento,
                  importeIva5: 0,
                  importeIva10: 0,
                  importeIvaExenta: 0,
                  importeNeto: detallePedido[index].importeNeto,
                  importePrecio: detallePedido[index].importePrecio,
                  importeTotal: detallePedido[index].importeTotal,
                  subTotal: detallePedido[index].subTotal,
                  totalKg: detallePedido[index].totalKg,
                  porcDescuento: detallePedido[index].porcDescuento,
                  porcIva: detallePedido[index].porcIva,
                  producto: detallePedido[index].producto,
                  unidadMedida: detallePedido[index].unidadMedida,
                  venta: null,
                  codVendedorErp: this.venta.codVendedorErp,
                  vendedor: this.venta.vendedor,
                  tipoDescuento: detallePedido[index].tipoDescuento
                };
                if (detalleVenta) {
                  console.log(detalleVenta);
                  this.ventaDetalles.push(detalleVenta);
                }
                if (index == detallePedido.length - 1) {
                  this.modalPedidos = 'oculto';
                  Swal.fire('Pedido cargado', 'El pedido se cargo exitosamente', 'success');
                }
              }
            });
        }
      });
    }
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
  mostrarModalDetalles() {
    this.modalDetalles = '';
  }

  async mostrarModalPedidos() {
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechaFin = moment(new Date()).format('YYYY-MM-DD');
    this.client = null;
    if (this.venta) {
      if (this.venta.importeTotal > 0) {
        this.invalido('Ya existe una venta en proceso');
        return;
      }
    }
    this.nroPedido = 0;
    this.modalPedidos = '';
    this.paginaPedido = 1;
    let pedidos = await this.getPedidosByFecha(0, this.fechaInicio, this.fechaFin, null, null, 10, 'PENDIENTE', false, 0);
    this.totalElementosPed = pedidos.totalElements;
    this.pageSizePed = 10;
    this.listaPedidos = pedidos.content;
  }

  async pagoNoContado() {
    this.venta.cliente = this.cliente;
    console.log(this.ventaDetalles);
    let x = await this.reHacerVenta();
    for (let i = 0; i < this.descuentos.length; i++) {
      if (this.descuentos[i]) {
        let ventaDescuento: VentaDescuento;
        ventaDescuento = {
          codDescuento: this.descuentos[i].codDescuento,
          codVenta: null,
          codVentaDescuento: null,
        };
        this.ventaDescuento.push(ventaDescuento);
      }
    }
    this.venta.codVendedorErp = this.vendedor.codVendedorErp;
    this.venta.cobranza = null;
    this.venta.porcDescuento = this.porcentajeDescuento;
    this.venta.detalle = this.ventaDetalles;
    this.venta.formaVenta = this.formaVenta;
    let objeto = {
      venta: this.venta,
      descuentos: this.ventaDescuento,
    };

    // 👇 NUEVO: mostrar loading antes de la llamada
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Guardando venta, espere por favor...',
      onBeforeOpen: () => { Swal.showLoading(); }
    });

    console.log('enviado ..', objeto);
    this._ventasServices.cerrarVenta(objeto).subscribe(
      (resp: any) => {
        Swal.close(); // 👈 cerrar loading en éxito
        let venta = resp.venta as Venta;
        console.log(venta.codVenta);
        if (venta.tipoComprobante == 'FACTURA') {
          this.verTicketPdf(venta.codVenta);
          this.limpiar();
        } else {
          this.router.navigate(['/ticketVenta/id/', venta.codVenta]);
        }
      },
      (error) => {
        Swal.close(); // 👈 cerrar loading en error
        console.error('Error al guardar venta (no contado):', error);

        let mensaje = 'Ocurrió un error al guardar la venta.';
        if (error.status === 504 || error.status === 408) {
          mensaje = 'El servidor tardó demasiado en responder (timeout). Verificá si la venta fue guardada antes de reintentar.';
        } else if (error.status === 0) {
          mensaje = 'Sin conexión con el servidor. Verificá tu red e intentá de nuevo.';
        } else if (error.status >= 500) {
          mensaje = "Error del servidor(${ error.status }).Si el problema persiste, contactá al administrador.";
        }

        Swal.fire({
          type: 'error',
          title: 'Error al guardar',
          text: mensaje,
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          cancelButtonText: 'Cancelar',
          confirmButtonClass: 'btn btn-warning',
          cancelButtonClass: 'btn btn-secondary',
          buttonsStyling: false,
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            this.pagoNoContado(); // 👈 reintentar
          }
        });
      }
    );
  }

  async definirFormaPagoVerif() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    if (!this.venta || !this.cliente) {
      this.invalido('Venta o cliente no puede ser nulo');
      return;
    }
    if (this.venta) {
      if (this.venta.importeTotal <= 0) {
        this.invalido('Venta debe ser mayor a 0');
        return;
      }
    }
    if (!this.formaVenta) {
      this.invalido('Seleccione forma venta');
      return;
    }
    //aplicar solo a lista que no sea de empleados
    if (this.listaPrecio.descripcion != 'EMPLEADOS') {
      let detalles: VentaDetalle[] = [];
      let grupos: AgrupadorKit[] = await this.buildGrupoMaterialDetal();
      console.log(grupos);
      let loadBonificacionClnKit = await this.loadBonificacionClnKit(grupos);
      let loadBonificacionClnProducto = await this.loadBonificacionClnProducto();
      detalles = this.ventaDetalles.filter(d => d.tipoDescuento == 'BONIF_CLN-PRODUCTO' || d.tipoDescuento == 'BONIF_CLN-KIT');
      if (detalles.length == 0) {
        let loadBonificacionProducto = await this.loadBonificacionProducto();
        let loadBonificacionKit = await this.loadBonificacionKit(grupos);
      }

    }
    this.venta.canal = this.canal;
    Swal.close();
    console.log(this.formaVenta);
    if (this.formaVenta.cantDias == 0) {
      this.mostrarModal();
    } else {
      this.pagoNoContado();
      console.log('se debe enviar la venta sin cobranza');
    }
  }


  buildGrupoMaterialDetal(): Promise<AgrupadorKit[]> {
    return new Promise<AgrupadorKit[]>(async (resolve) => {
      let grupos: AgrupadorKit[] = [];
      for await (const detalle of this.ventaDetalles) {// recorrer detalles para arma grupos por cantidad
        let grpMaterial: AgrupadorKit = new AgrupadorKit();
        let indice: number = -1;
        if (grupos) { // si el grupo esta vacio no se puede evaluar el indice
          indice = grupos.findIndex((g) => g.grpMaterial == detalle.producto.grpMaterial);
        } else {
          indice = -1;
        }
        if (indice == -1) { // si no hay indice el grupo se debe insertar en el array o de lo contrario se aumenta la cantidad
          if (detalle.producto.grpMaterial) {
            grpMaterial.grpMaterial = detalle.producto.grpMaterial;
            grpMaterial.cantidad = detalle.cantidad;
            console.log(grpMaterial);
            grupos.push(grpMaterial);
          } else {
            console.log('Material ' + detalle.producto.codProductoErp + '  sin grupo');
          }
        } else {
          console.log(indice);
          console.log(grupos[indice]);
          console.log('GRUPO ENCONTRADO');
          grupos[indice].cantidad = grupos[indice].cantidad + detalle.cantidad;
        }
      }
      resolve(grupos);
    });
  }

  quitarBonificaciones(): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const detalle of this.ventaDetalles) {
        switch (detalle.tipoDescuento) {
          case 'BONIF_PRODUCTO': {
            let index = this.ventaDetalles.indexOf(detalle);
            this.ventaDetalles.splice(index, 1);
          }
            break;
          case 'BONIF_CLN-PRODUCTO': {
            let index = this.ventaDetalles.indexOf(detalle);
            this.ventaDetalles.splice(index, 1);
          }
            break;
          case 'BONIF_KIT': {
            let index = this.ventaDetalles.indexOf(detalle);
            this.ventaDetalles.splice(index, 1);
          }
            break;
          case 'BONIF_CLN-KIT': {
            let index = this.ventaDetalles.indexOf(detalle);
            this.ventaDetalles.splice(index, 1);
          }
            break;
          default:
            break;
        }
      }
      resolve(true);
    });
  }




  loadBonificacionProducto(): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const detalle of this.ventaDetalles) {
        let bonificacionProducto = await this.getBonificacionProducto(detalle.cantidad, this.listaPrecio.codListaPrecio, detalle.producto.codProducto);
        if (bonificacionProducto) {
          console.log('BONIFICACION-PRODUCTO');
          let precio = await this.getPrecio(bonificacionProducto.cantBonif, bonificacionProducto.materialBonif.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
          let detalleVenta: VentaDetalle;
          detalleVenta = {
            codVentaDetalle: null,
            nroItem: (this.ventaDetalles.length + 1),
            cantidad: bonificacionProducto.cantBonif,
            importeDescuento: 0,
            importeIva5: 0,
            importeIva10: 0,
            importeIvaExenta: 0,
            importeNeto: 0,
            importePrecio: precio.precio,
            importeTotal: 0,
            subTotal: 0,
            totalKg: 0,
            porcDescuento: 0,
            porcIva: 0,
            producto: bonificacionProducto.materialBonif,
            unidadMedida: precio.unidadMedida,
            venta: null,
            vendedor: this.vendedor,
            codVendedorErp: this.vendedor.codVendedorErp,
            tipoDescuento: 'BONIF_PRODUCTO'
          };
          this.ventaDetalles.push(detalleVenta);
        } else {
          console.log('BONIFICACION  PRODUCTO NO ENCONTADA');
        }
      }
      resolve(true);
    });
  }

  loadBonificacionClnProducto(): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const detalle of this.ventaDetalles) {
        let bonificacionClnProducto = await this.getBonificacionClnProducto(detalle.cantidad, this.listaPrecio.codListaPrecio, detalle.producto.codProducto, this.cliente.codCliente);
        if (bonificacionClnProducto) {
          console.log('BONIFICACION CLN-PRODUCTO');
          let precio = await this.getPrecio(bonificacionClnProducto.cantBonif, bonificacionClnProducto.materialBonif.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
          let detalleVenta: VentaDetalle;
          detalleVenta = {
            codVentaDetalle: null,
            nroItem: (this.ventaDetalles.length + 1),
            cantidad: bonificacionClnProducto.cantBonif,
            importeDescuento: 0,
            importeIva5: 0,
            importeIva10: 0,
            importeIvaExenta: 0,
            importeNeto: 0,
            importePrecio: precio.precio,
            importeTotal: 0,
            subTotal: 0,
            totalKg: 0,
            porcDescuento: 0,
            porcIva: 0,
            producto: bonificacionClnProducto.materialBonif,
            unidadMedida: precio.unidadMedida,
            venta: null,
            vendedor: this.vendedor,
            codVendedorErp: this.vendedor.codVendedorErp,
            tipoDescuento: 'BONIF_CLN-PRODUCTO'
          };
          this.ventaDetalles.push(detalleVenta);
        } else {
          console.log('BONIFICACION CLN-PRODUCTO NO ENCONTADA');
        }
      }
      resolve(true);
    });
  }



  loadBonificacionKit(gruposMateriales: AgrupadorKit[]): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const grp of gruposMateriales) {
        let bonificacionKit = await this.getBonificacionKit(grp.cantidad, this.listaPrecio.codListaPrecio, grp.grpMaterial);
        console.log(bonificacionKit);
        if (bonificacionKit) {
          console.log('BONIFICACION KIT');
          let precio = await this.getPrecio(bonificacionKit.cantBonif, bonificacionKit.materialBonif.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
          let detalleVenta: VentaDetalle;
          detalleVenta = {
            codVentaDetalle: null,
            nroItem: (this.ventaDetalles.length + 1),
            cantidad: bonificacionKit.cantBonif,
            importeDescuento: 0,
            importeIva5: 0,
            importeIva10: 0,
            importeIvaExenta: 0,
            importeNeto: 0,
            importePrecio: precio.precio,
            importeTotal: 0,
            subTotal: 0,
            totalKg: 0,
            porcDescuento: 0,
            porcIva: 0,
            producto: bonificacionKit.materialBonif,
            unidadMedida: precio.unidadMedida,
            venta: null,
            vendedor: this.vendedor,
            codVendedorErp: this.vendedor.codVendedorErp,
            tipoDescuento: 'BONIF_KIT'
          };
          this.ventaDetalles.push(detalleVenta);
        } else {
          console.log('BONIFICACION KIT NO ENCONTADA');
        }
      }
      resolve(true);
    });
  }
  loadBonificacionClnKit(gruposMateriales: AgrupadorKit[]): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      for await (const grp of gruposMateriales) {
        let bonificacionClnKit = await this.getBonificacionClnKit(grp.cantidad, this.listaPrecio.codListaPrecio, grp.grpMaterial, this.cliente.codCliente);
        if (bonificacionClnKit) {
          console.log('BONIFICACION CLN-KIT');
          let precio = await this.getPrecio(bonificacionClnKit.cantBonif, bonificacionClnKit.materialBonif.codProducto, this.listaPrecio.codListaPrecio, this.cliente.codCliente);
          let detalleVenta: VentaDetalle;
          detalleVenta = {
            codVentaDetalle: null,
            nroItem: (this.ventaDetalles.length + 1),
            cantidad: bonificacionClnKit.cantBonif,
            importeDescuento: 0,
            importeIva5: 0,
            importeIva10: 0,
            importeIvaExenta: 0,
            importeNeto: 0,
            importePrecio: precio.precio,
            importeTotal: 0,
            subTotal: 0,
            totalKg: 0,
            porcDescuento: 0,
            porcIva: 0,
            producto: bonificacionClnKit.materialBonif,
            unidadMedida: precio.unidadMedida,
            venta: null,
            vendedor: this.vendedor,
            codVendedorErp: this.vendedor.codVendedorErp,
            tipoDescuento: 'BONIF_CLN-KIT'
          };
          this.ventaDetalles.push(detalleVenta);
        } else {
          console.log('BONIFICACION CLN-KIT NO ENCONTADA');
        }

      }
      resolve(true);
    });
  }

  async getBonificacionProducto(cantidad: number, codListaPrecio: number, codProducto: number) {
    let bonificacion = this._bonificacionServices.getBonificacionProducto(cantidad, codListaPrecio, codProducto).toPromise();
    return bonificacion;
  }

  async getBonificacionKit(cantidad: number, codListaPrecio: number, grpMaterial: string) {
    let bonificacion = this._bonificacionServices.getBonificacionKit(cantidad, codListaPrecio, grpMaterial).toPromise();
    return bonificacion;
  }

  async getBonificacionClnProducto(cantidad: number, codListaPrecio: number, codProducto: number, codCliente: number) {
    let bonificacion = this._bonificacionServices.getBonificacionClnProducto(cantidad, codListaPrecio, codProducto, codCliente).toPromise();
    return bonificacion;
  }

  async getBonificacionClnKit(cantidad: number, codListaPrecio: number, grpMaterial: string, codCliente: number) {
    let bonificacion = this._bonificacionServices.getBonificacionClnKit(cantidad, codListaPrecio, grpMaterial, codCliente).toPromise();
    return bonificacion;
  }

  async definirFormaPago() {
    console.log(this.porcentajeDescuento);
    console.log(this.limitePorcentajeDescuento);
    try {
      if (this.porcentajeDescuento > this.limitePorcentajeDescuento) {
        Swal.fire({
          title: 'Está seguro?',
          text: `¿Seguro que desea  cerrar la venta con el porcentaje de descuento mayor a ` +
            this.limitePorcentajeDescuento +
            `% ?`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, pasar a cobranza!',
          cancelButtonText: 'No, cancelar!',
          confirmButtonClass: 'btn btn-success',
          cancelButtonClass: 'btn btn-danger',
          buttonsStyling: false,
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            this.definirFormaPagoVerif();
          }
        });
      } else {

        await this.definirFormaPagoVerif();
      }

    } catch (error) {
      console.log(error);
      Swal.fire('Atención', error, 'warning');
    }
  }

  cerrarModal() {
    this.oculto = 'oculto';
    this.limpiar();
  }
  async cancelarModal() {
    let cancelarBonificaciones = await this.quitarBonificaciones();
    this.oculto = 'oculto';
    this.medioPago.splice(0, this.medioPago.length);
    this.tipoMedioPago.splice(0, this.tipoMedioPago.length);
    this.bancos.splice(0, this.bancos.length);
  }

  cancelarModalPedidos() {
    this.nroPedido = 0;
    this.modalPedidos = 'oculto';
  }
  cancelarModalDetalles() {
    this.modalDetalles = 'oculto';
  }

  guardarCobranza() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    let montoCobrandoCab = this.venta.importeTotal;
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
    if (this._tieneDescuentoGrupo == true) {
      let indice = this.descuentos.indexOf(this.descuentoGrupoActual);
      this.descuentos.splice(indice, 1);
    }
    for (let i = 0; i < this.descuentos.length; i++) {
      if (this.descuentos[i].codDescuento > 0) {
        // cargo los descuentos
        let ventaDescuento: VentaDescuento;
        ventaDescuento = {
          codDescuento: this.descuentos[i].codDescuento,
          codVenta: null,
          codVentaDescuento: null,
        };
        this.ventaDescuento.push(ventaDescuento);
      }
    }
    /*********      cargar cobranzas       ****** */
    this.cobranza.importeAbonado = this.totalAbonado;
    this.cobranza.saldo = this.cobranza.importeCobrado - this.totalAbonado;
    this.cobranza.detalle = null;
    this.cobranza.detalle = this.cobranzasDetalle;
    /*********      cargar ventas         ****** */

    this.venta.cobranza = this.cobranza;
    this.venta.porcDescuento = this.porcentajeDescuento;
    this.venta.detalle = null;
    this.venta.pedido = this.pedido;
    this.venta.detalle = this.ventaDetalles;
    let objeto = {
      venta: this.venta,
      descuentos: this.ventaDescuento,
    };
    console.log('enviado ..', objeto);
    this._ventasServices.cerrarVenta(objeto).subscribe(
      async (resp: any) => {
        if (this.cuponPromo && this.cuponPromo?.alianza) {
          let invalidarCupon = await this.invalidarCupon();
        }
        Swal.close();
        let venta = resp.venta as Venta;
        console.log(venta.codVenta);
        if (venta.tipoComprobante == 'FACTURA') {
          this.verTicketPdf(venta.codVenta);
          this.limpiar();
        } else {
          this.router.navigate(['/ticketVenta/id/', venta.codVenta]);
        }
      },
      (error) => {
        Swal.close(); // 👈 Cierra el spinner siempre que haya error
        console.error('Error al guardar cobranza:', error);

        let mensaje = 'Ocurrió un error al guardar la cobranza.';
        if (error.status === 504) {
          mensaje = 'El servidor tardó demasiado en responder (timeout). Verificá si la cobranza fue guardada antes de reintentar.';
        } else if (error.status === 0) {
          mensaje = 'Sin conexión con el servidor. Verificá tu red.';
        } else if (error.status >= 500) {
          mensaje = `Error del servidor (${error.status}). Contactá al administrador`;
        }

        Swal.fire({
          type: 'error',
          title: 'Error al guardar',
          text: mensaje,
          showCancelButton: true,
          confirmButtonText: 'Reintentar',
          cancelButtonText: 'Cancelar',
          confirmButtonClass: 'btn btn-warning',
          cancelButtonClass: 'btn btn-secondary',
          buttonsStyling: false,
          reverseButtons: true,
        }).then((result) => {
          if (result.value) {
            this.guardarCobranza(); // 👈 reintentar
          }
        });
      });
  }

  verTicketPdf(venta: number) {
    this._ventasServices.verTicketPdf(venta, '').subscribe((response: any) => {
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
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
      tipo: 'VENTA'
    };
  }
  usar(monto) {
    this.montoAbonado = monto;
  }
  async iniciarCabecera() {
    const canalPrincipal = await this.getCanalPrincipal(); // esperar el canal primero

    this.venta = {
      codVenta: null,
      anulado: false,
      codEmpresaErp: this.user.codEmpresaErp,
      codSucursalErp: this.user.codSucursalErp,
      codEmpresa: this.user.codEmpresa,
      codSucursal: this.user.codSucursal,
      estado: 'TEMP',
      modoEntrega: 'CONTRA_ENTREGA',
      fechaAnulacion: null,
      fechaCreacion: null,
      fechaVencimiento: null,
      fechaVenta: moment(new Date()).format('YYYY-MM-DD'),
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
      timbrado: '',
      inicioTimbrado: '',
      finTimbrado: '',
      codUsuarioAnulacion: null,
      nroComprobante: '',
      tipoComprobante: '',
      terminalVenta: this.terminal,
      deposito: this.deposito,
      cobranza: null,
      codUsuarioCreacion: this.user.codUsuario,
      cliente: this.cliente,
      pedido: null,
      formaVenta: this.formaVenta,
      detalle: null,
      motivoAnulacion: null,
      esObsequio: false,
      editable: false,
      codVendedorErp: this.vendedor.codVendedorErp,
      listaPrecio: this.listaPrecio,
      vendedor: this.vendedor,
      tipoVenta: 'POS',
      canal: canalPrincipal, // asignamos la variable ya resuelta
      cupon: null
    };
  }

  limpiar() {
    this.descuentoExtraInfluencer = 0;
    this.nroPedido = 0;
    this.tipoEcommerce = false;
    this.cobranzaPedidoAux = null;
    this.cobranza = null;
    this._tieneDescuentoClienteFull = false;
    this.ventaDetalleAux = null;
    //this.vendedor = null;
    this.cancelarStockComprometido(this.deposito.codDeposito, this.ventaDetalles);
    console.log('LIMPIAR();');
    this._importeDescontable = 0;
    this.codCobranzaDetalle = 0;
    this.oculto = 'oculto';
    this.modalCupon = 'oculto';
    this.cuponPromo = null;
    this.codigoCupon = '';
    this.cargando = false;
    this.paginas.length = 0;
    this.calculoTotalCantidad = 0;
    this.initDescuentos();
    this.totalElementos = 0;
    this.totalAbonado = 0;
    this.cantidad = 1;
    this.montoAbonado = 0;
    this.vuelto = 0;
    this.medioPago.splice(0, this.medioPago.length);
    this.ventaDescuento.splice(0, this.ventaDetalles.length);
    this.ventaDetalles.splice(0, this.ventaDetalles.length);
    this.cobranzasDetalle.splice(0, this.cobranzasDetalle.length);
    this.clientes.splice(0, this.clientes.length);
    this.productos.splice(0, this.productos.length);
    this.iniciarCabecera();
    this.iniciarCobranza();
    this.nroRef = '';
    this.categoriaSeleccionada = this.categoriaTodos;
    this.ngOnInit();
  }

  initDescuentos() {
    this.limitePorcentajeDescuento = 0;
    this.descuentoGrupoActual = null;
    this.descuentoClienteActual = null;
    this.descuentoImporteActual = null;
    this.descuentoSucursalActual = null;
    this.porcentajeDescuento = 0;
    this._tieneDescuentoGrupo = false;
    this._tieneDescuentoSucursal = false;
    this._tieneDescuentoCliente = false;
    this._tieneDescuentoClienteFull = false;
    this.descuentos.splice(0, this.descuentos.length);
  }


  cambioForma(event) {
    for (let indice = 0; indice < this.formas.length; indice++) {
      // tslint:disable-next-line:triple-equals
      if (this.formas[indice].codFormaVenta == this.seleccionFormaVenta) {
        this.formaVenta = this.formas[indice];
        console.log(this.formaVenta);
      }
    }
  }

  cerrarModalCliente() {
    this.modalCliente = 'oculto';
  }
  /****************************verificar cliente******************************* */

  verificarVenta() {
    if (this.venta.importeTotal > 0) {
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
        reverseButtons: true,
      }).then((result) => {
        if (result.value) {
          this.guardarDetalles();
        }
      });
    } else {
      this.cambiarCliente();
    }
  }

  async cancelarStockComprometido(codDeposito, detalles) {
    let detall = this._stockServices
      .cancelarComprometido(codDeposito, detalles)
      .toPromise();
    return detall;
  }

  async guardarDetalles() {
    let detall = await this.cancelarStockComprometido(
      this.deposito.codDeposito,
      this.ventaDetalles
    );
    console.log('detall', detall);

    let _detallesLocalStorage: VentaDetalle[] = ([] = this.ventaDetalles);
    localStorage.setItem(
      'detalles',
      window.btoa(JSON.stringify(_detallesLocalStorage))
    );
    this.cambiarCliente();
  }

  cerrarModalTerminal() {
    this.modalTerminal = 'oculto';
    this.router.navigate(['/dashboard']);
  }

  cambioTerminal(event) {
    let index = this.terminales.findIndex((t) => t.codTerminalVenta == this.seleccionTerminal)
    this.terminal = this.terminales[index];
  }

  seleccionCliente(event: Cliente) {
    console.log(event);
    this.client = event;
  }

  async actualizarToken() {
    let token = this._loginServices.actualizarToken().toPromise();
    return token;
  }
  async guardarTerminal() {
    for (let indice = 0; indice < this.terminales.length; indice++) {
      // tslint:disable-next-line:triple-equals
      if (this.terminales[indice].codTerminalVenta == this.seleccionTerminal) {
        this.terminal = this.terminales[indice];
        let changeUsuarioSucursal: Usuarios = await this.changeSucursal(this.terminal.codSucursal);
        this._loginServices.user.codSucursal = changeUsuarioSucursal.sucursal.codSucursal;
        this._loginServices.user.codSucursalErp = changeUsuarioSucursal.sucursal.codSucursalErp;
        let actualizartoken = await this.actualizarToken();
        this.terminal.id = UUID.UUID();
        localStorage.setItem('tv', window.btoa(JSON.stringify(this.terminal)));
        Swal.fire(
          'Terminal Registrada',
          `Terminal: ${this.terminal.descripcion} registrada con exito`,
          'success'
        );
        this.ngOnInit();
        this.modalTerminal = 'oculto';
      }
    }
  }
  error(err) {
    this.toastr.error(err, 'Error', { timeOut: 2500 });
  }

  filtrarCategoria(categoria: CategoriaProducto) {
    if (categoria) {
      this.categoriaSeleccionada = categoria;
      this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
    } else {
      this.traerProductos(0, this.busqueda, 0);
    }
  }

  /***************************************************************************************** */

  // ====================================Seccion ASYNC==================================================
  /*  async getPedidosByFecha(page: any, fechainicio: any, fechafin: any, cliente: Cliente, usuario: Usuarios, codSucursal: number, size: number, estado: string, anulado: any, nroPedido: number) {
     let pedidos = this._pedidosServices.findByFecha(page, fechainicio, fechafin, cliente, usuario, codSucursal, size, estado, anulado, nroPedido)
       .toPromise();
     return pedidos;
   } */
  async getPedidosByFecha(page: any, fechainicio: any, fechafin: any, cliente: Cliente, usuario: Usuarios, size: number, estado: string, anulado: any, nroPedido: number) {
    let codSucursal = 0;
    if (this.user) {
      if (this.user.authorities[0] == 'ROLE_CAJERO') {
        codSucursal = this.user.codSucursal;
      }
    }
    let pedidos = this._pedidosServices.findByFecha(page, fechainicio, fechafin, cliente, usuario, codSucursal, size, estado, anulado, '', nroPedido)
      .toPromise();
    return pedidos;
  }

  async getBancos() {
    let bancos = this._bancosServices.traerByCodEmp(this.user.codEmpresa).toPromise();
    return bancos;
  }
  async getMediosPagos() {
    let medioPagos = this._medioPagoServices.traerMedioPago(this.user.codEmpresa).toPromise();
    return medioPagos;
  }

  async getTipoMediosPagos() {
    let TipoMedioPagos = this._tipoMedioPagoServices.traerByCodEmp(this.user.codEmpresa).toPromise();
    return TipoMedioPagos;
  }

  async getDepositoVenta() {
    let deposito = this._depositoServices.getDepositoVenta(this._loginServices.user.codEmpresa, this._loginServices.user.codSucursal).toPromise();
    return deposito;
  }
  async getCanales() {
    let canales = this._canalServices.traerByCodEmp(this._loginServices.user.codEmpresa).toPromise();
    return canales;
  }
  async getCanalPrincipal() {
    let canal = this._canalServices.getCanal().toPromise();
    return canal;
  }
  async getSucursal() {
    let sucursal = this._sucursalServices.getSucursalbyId(this._loginServices.user.codSucursal).toPromise();
    return sucursal;
  }

  async getComprobanteByTerminal(terminal: Terminales) {
    let comprobante = this._comprobanteServices.getComprobanteByTerminalId(terminal.codTerminalVenta).toPromise();
    return comprobante;
  }

  async getStock(codProducto: number) {
    let stock = this._stockServices.traerStock(this.deposito.codDeposito, codProducto).toPromise();
    return stock;
  }
  async vendedorByCodUser() {
    let vendedor = this._vendedorServices.getByCodUser(this._loginServices.user.codUsuario).toPromise();
    return vendedor;
  }
  async traerListasPrecio() {
    let listas = this._listaPrecioServices.traerListaPrecio(this._loginServices.user.codEmpresa).toPromise();
    return listas;
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
    console.log(descuento);
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


  async buscarCupon(codigoCupon) {
    let cupon = this._cuponServices.getCuponByCupon(this._loginServices.user.codEmpresa, codigoCupon).toPromise();
    return cupon;
  }
  async obtenerDescuentoInflCupon(codigoCupon) {
    let cupon = this._influencerServices.obtenerDescuento(this._loginServices.user.codEmpresa, codigoCupon, this.cliente.codCliente).toPromise();
    return cupon;
  }

  async invalidarCupon() {
    let cupon = this._cuponServices.invalidarCupon(this.cuponPromo.cupon, this.cliente).toPromise();
    return cupon;
  }


  async changeSucursal(codSucursal: number) {
    let updateUsuarioSucursal = this._loginServices.changeSucursal(codSucursal).toPromise();
    return updateUsuarioSucursal;
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

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
