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
import { ProductoService, ClienteService, PrecioService, ListaPrecioService, VendedorService } from '../../services/service.index';

import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { User } from '../../models/user.model';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { MedioPago } from '../../models/medioPago.model';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { Venta } from '../../models/venta.model';
import { Cobranza } from '../../models/cobranza.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { VentasService } from '../../services/ventas/ventas.service';
import { VentaDescuento } from '../../models/VentaDescuento.model';
import { ToastrService } from 'ngx-toastr';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { Bancos } from '../../models/bancos.model';
import { LoginService } from '../../services/service.index';
import { ErrModel } from '../../models/ErrModel.model';
import { TerminalService } from '../../services/terminales/terminales.service';
import { Terminales } from '../../models/terminales.model';
import { UUID } from 'angular2-uuid';
import { DepositoService } from '../../services/deposito/deposito.service';
import { StockService } from '../../services/stock/stock.service';
import { Deposito } from '../../models/deposito.model';
import { Stock } from '../../models/stock.model';
import { PrecioMaterialService } from '../../services/precioMaterial/precioMaterial.service';
import { PrecioMaterial } from '../../models/precioMaterial.model';
import { Comprobantes } from '../../models/comprobantes.model';
import { ComprobantesService } from '../../services/comprobantes/comprobantes.service';
import { Vendedor } from '../../models/vendedor.model';
import { InputDebounceComponent } from '../../components/inputDebounce/inputDebounce.component';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { CanalService } from 'src/app/services/canales/canales.service';



@Component({
  selector: 'app-obs',
  templateUrl: './obsequios.component.html',
  styleUrls: ['./obsequios.component.css']
})
export class ObsequiosComponent implements OnInit {

  /* ===========ARRAYS=================== */
  paginas = [];
  cobranzasDetalle: CobranzaDetalle[] = [];
  tipoMedioPago: TipoMedioPago[] = [];
  listasPrecio: ListaPrecio[] = [];
  medioPago: MedioPago[] = [];
  productos: Producto[] = [];
  bancos: Bancos[] = [];
  descuentos: Descuento[] = [];
  ventaDescuento: VentaDescuento[] = [];
  ventaDetalles: VentaDetalle[] = [];
  detallesAux: VentaDetalle[] = [];
  clientes: Cliente[] = [];
  errores: ErrModel[] = [];
  terminales: Terminales[] = [];
  depositos: Deposito[] = [];
  categorias: CategoriaProducto[] = [];

  /* ===========objetos=================== */
  obsequio: MedioPago;
  deposito: Deposito;
  comprobante: Comprobantes;
  private terminal: Terminales;
  cobranza: Cobranza;
  itemDescuento: Descuento;
  user: User;
  selectModelCliente: Cliente;
  client: Cliente;
  selectModelMedio: MedioPago;
  selectModelTipoMedioPago: TipoMedioPago;
  selectModelBanco: Bancos;
  cliente: Cliente;
  listaPrecio: ListaPrecio;
  paginador: any;
  venta: Venta;
  vendedor: Vendedor;
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
  nroCuenta: string;
  medioPagoLabel: string;
  oculto: string = 'oculto';
  modalTerminal: string = 'oculto';
  size: string = 'md';
  busqueda: string = '';
  rutaPaginador: string = '/obsequios/page';
  razonSocial: string;
  tamanhoPag: string = 'md';
  sinImagen: string = './assets/images/sin-imagen.jpg';
  img: string = './assets/images/jabon.png';
  /* searchModelProducto: any = ''; */
  /* ===========boolean=================== */
  msgAdvertencia: boolean = false;
  deshabilitarBuscador: boolean = true;
  cargando: boolean = false;
  mostrarCliente: boolean = false;
  autorizado: boolean = false;
  mostraCantidad: boolean = false;
  mostrarForm: boolean = false;
  excIva: boolean = false;
  _tieneDescuentoCliente: boolean = false;
  _tieneDescuentoSucursal: boolean = false;
  /* ===========number=================== */
  limitePorcentajeDescuento: number = 0;
  seleccionTerminal: number;
  porcentajeDescuento: number = 0;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0; pageSizePed: number = 0;
  totalElementosPed: number = 0;
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
  /***************mask*********** */
  @ViewChild('inputProducto') inputProducto: InputDebounceComponent;
  public ifAllowed: boolean = false;

  constructor(
    private toastr: ToastrService,
    private location: Location,
         public _canalServices: CanalService,
    public _vendedorServices: VendedorService,
    public _precioServices: PrecioService,
    public _listaPrecioServices: ListaPrecioService,
    public router: Router,
    public http: HttpClient,
    public _productosServices: ProductoService,
    public _comprobanteServices: ComprobantesService,
    public _precioMaterialServices: PrecioMaterialService,
    public _terminalServices: TerminalService,
    public _clientesServices: ClienteService,
    public _loginServices: LoginService,
    public _empresaServices: EmpresasService,
    public _medioPagoServices: MedioPagoService,
    private activatedRoute: ActivatedRoute,
    private _ventasServices: VentasService,
    public _depositoServices: DepositoService,
    public _stockServices: StockService,
    public _categoriaService: CategoriaService
  ) { }






  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event: Event) {
    this.cancelarStockComprometido(this.deposito.codDeposito, this.ventaDetalles);
    // this._loginServices.logout();
    this.router.navigate(['/obsequios']);
    this.min();


  }


  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges() {
    this.min();
    this.razonSocial = this.cliente.razonSocial;
  }


  ngOnInit() {
    this.categoriaSeleccionada = this.categoriaTodos;
    this.min();
    this.deshabilitarBuscador = true;
    this.router.navigate(['/obsequios/page', 0]);
    this.user = this._loginServices.user;
    /*==========Observa la paginación =======================*/
    this.activatedRoute.paramMap.subscribe(params => {
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
    if (localStorage.getItem('tv')) { /***Si hay terminal se verifica si ******/
      this.terminal = JSON.parse(window.atob(localStorage.getItem('tv')));
      if (this.terminal) {
        this._terminalServices.getTerminalById(this.terminal.codTerminalVenta)
          .subscribe((terminal: Terminales) => {
            if (this.terminal) {
              this.autorizado = true;
              /****************Si UUI es valida************************************** */
              this.cargar(); // se llama a varios servicios para iniciar objetos empreesa,clientes, mediopago ect
              this.token = this._loginServices.token;
              if (this.cliente) {
                /*==========Observa la paginación =======================*/
                this.activatedRoute.paramMap.subscribe(params => {
                  let page: number = +params.get('page');
                  if (!page) {
                    page = 0;
                    this.router.navigate(['/obsequios/page', 0]);
                  }
                  this.traerProductos(page, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
                });
                /*=====================================================*/
              }
              /*******************Si UUI es valida fin****************************** */
            } else if (localStorage.getItem('tv') && this.autorizado == true) {
              /***no hacer absolutamente nada */
            } else {
              Swal.fire('Terminal no valida', `Terminal: ${this.terminal.descripcion} no valida`, 'error');
              localStorage.removeItem('tv');
              this.router.navigate(['/dashboard']);
              return;
            }
          });
      }

    } else {
      /********************************** */
      /***********Modal terminal********** */
      this._terminalServices.traerterminalesDisponibles(this.user.codEmpresa, this.user.codSucursal)
        .subscribe((response: any) => {
          this.terminales = response as Terminales[];
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
      e.stopPropagation()
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


  // 01cargarComprobante
  // 02minimizar menu
  // 03traer cliente default
  // 04cargar forma venta
  // 05cargar descuentos

  async cargar() {
    let vendedor: Vendedor = await this.getVendedorByCodUser();
    if (!vendedor) {
      this.router.navigate(['/dashboard']);
      this.invalido('usuario no es vendedor');
    }
    this.vendedor = vendedor;
    this.getComprobanteByTerminal(this.terminal);
    this.min(); // no importa en que tiempo se ejecute
    this.porcentajeDescuento = 0;
    this.limitePorcentajeDescuento = this.user.maxDescuentoPorc;
    this.listasPrecio = await this.getListaPrecio();
    console.log(this.listasPrecio); let categorias = await this.getCategorias();
    if (!categorias) {
      this.router.navigate(['/dashboard']);
      this.invalido('No existen categorias');
    }
    this.categorias = categorias;
    console.log(this.categorias);
    this.categorias.unshift(this.categoriaTodos);

    this._depositoServices.getDepositoVenta(
      this._loginServices.user.codEmpresa,
      this._loginServices.user.codSucursal
    ).subscribe((dep) => {
      if (dep) {

        this.deposito = dep;
        this._clientesServices.getClientePropietario().subscribe((cliente: Cliente) => {
          if (cliente) {
            this.cliente = cliente;
            this.razonSocial = this.cliente.concatDocNombre;
            this.listaPrecio = this.cliente.listaPrecio;
            this.iniciarCabecera(); // no importa en que tiempo se ejecute mientras exista cliente default
            this.iniciarCobranza(); // no importa en que tiempo se ejecute mientras exista cliente default
            console.log('cliente PROPIETARIO :', this.cliente);
            // solo si no es empleado podemos evaluar si puede tener descuento por sucursal
            // y si tiene desucento por sucursal no puede tener descuento de cliente
            console.log(cliente);
            this.venta.deposito = this.deposito;
            this.mostrarCliente = true;
            this.deshabilitarBuscador = false;
            this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
          } else {
            this.invalido('No existe cliente PROPIETARIO');
          }
        });
      } else {
        this.router.navigate(['/dashboard']);
        this.invalido('LA SUCURSAL NO POSEE UN DEPOSITO DE VENTAS');
      }
    });
  }

  getComprobanteByTerminal(terminal: Terminales) {
    this._comprobanteServices.getComprobanteByTerminalId(terminal.codTerminalVenta).subscribe((cop: Comprobantes) => {
      this.comprobante = cop;
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

  async getStock(codProducto) {
    let stock = this._stockServices.traerStock(
      this.deposito.codDeposito,
      codProducto)
      /* .subscribe((stock: Stock) => {
     return stock;
        }); */
      .toPromise();
    return stock;
  }

  setStock(stock) {
    this._stockServices.update(stock)
      .subscribe((res) => console.warn('*********stock alterado'));
  }
  async seleccionarProducto(producto: Producto) {
    if (this.comprobante.maxItems <= this.ventaDetalles.length) {
      this.invalido('SE HA ALCANZADO EL LIMITE DE ITEMS POR FACTURA');
      return;
    }
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    let stock: Stock = null;
    if (producto.inventariable == true) {
      stock = await this.getStock(producto.codProducto);
      if (!stock) {
        this.invalido('EL PRODUCTO INVENTARIABLE NO POSEE STOCK');
        return;
      }
      console.warn('STOCK', stock);
    }
    let unidadDetalle: UnidadMedida = null;
    let unidadM: UnidadMedida = null;
    unidadM = await this.buscarUnidadMedida(producto);
    if (unidadM) {
      unidadDetalle = unidadM;
    } else {
      unidadDetalle = producto.unidad;
    }
    console.log('cliente', this.cliente);
    console.log(producto);
    let bandera: boolean = true;
    if (this.cantidad > 0) {
      //  se recorre el array y se verifica si el codPRoducto ya existe en el array o si se debe insertar
      for (let indice = 0; indice < this.ventaDetalles.length; indice++) {
        if (this.ventaDetalles[indice].producto.codProducto === producto.codProducto) {
          bandera = false;
          this._precioMaterialServices.findByPrecioCostoActual(
            this.ventaDetalles[indice].producto.codProductoErp,
            this.user.codSucursalErp)
            .subscribe(async (precioMaterial: PrecioMaterial) => {
              //  existe.. entonces se aumenta el objeto y se cierra la bandera para que salte
              if (precioMaterial) { // si el producto tiene precio
                /********************************************Stock************************************ */
                if (producto.inventariable == true) {
                  console.log('STOCK', stock);
                  let stockDisponible = stock.existencia - stock.comprometido;
                  let nuevoStockComprometido = stock.comprometido;
                  if (this.cantidad <= stockDisponible) {
                    nuevoStockComprometido = nuevoStockComprometido + this.cantidad;
                    stock.comprometido = nuevoStockComprometido;
                    this.setStock(stock);
                    console.warn('STOCK', stock);
                  }
                  if (this.cantidad > stockDisponible) {
                    this.cantidad = 1;
                    this.invalido('El producto no tiene stock disponible');
                    return;
                  }
                }
                /********************************************Stock************************************ */
                this.ventaDetalles[indice].cantidad = this.ventaDetalles[indice].cantidad + this.cantidad;
                this.ventaDetalles[indice].importePrecio = precioMaterial.precioCosto;
                let totalSinDescuento = (this.ventaDetalles[indice].cantidad * this.ventaDetalles[indice].importePrecio);
                this.ventaDetalles[indice].totalKg = (this.ventaDetalles[indice].cantidad * this.ventaDetalles[indice].producto.peso);
                this.ventaDetalles[indice].subTotal = totalSinDescuento;
                this.ventaDetalles[indice].importeDescuento = 0;
                let importeIVA = Math.round((totalSinDescuento * 10) / 100);
                this.ventaDetalles[indice].importeTotal = totalSinDescuento - this.ventaDetalles[indice].importeDescuento;
                this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].importeTotal + importeIVA;
                this.ventaDetalles[indice].vendedor = this.vendedor;
                this.ventaDetalles[indice].codVendedorErp = this.vendedor.codVendedorErp;
                switch (this.ventaDetalles[indice].porcIva) {
                  case 0: {
                    this.ventaDetalles[indice].importeIva5 = 0;
                    this.ventaDetalles[indice].importeIva10 = 0;
                    this.ventaDetalles[indice].importeIvaExenta = this.ventaDetalles[indice].importeTotal;
                    this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal;
                  } break;
                  case 5: {
                    this.ventaDetalles[indice].importeIva5 = Math.round(this.ventaDetalles[indice].importeTotal / 21);
                    this.ventaDetalles[indice].importeIva10 = 0;
                    this.ventaDetalles[indice].importeIvaExenta = 0;
                    this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal - this.ventaDetalles[indice].importeIva5;
                  } break;
                  case 10: {
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
                  } break;
                  default:
                    break;
                }

                /****cambiar de ubicacion el elemento* */
                let detalleItemAux: VentaDetalle = this.ventaDetalles[indice];
                let index = this.ventaDetalles.indexOf(this.ventaDetalles[indice]);
                this.ventaDetalles.splice(index, 1);
                this.ventaDetalles.push(detalleItemAux);  /// insertar
                /******************* */

                this.notificacionProducto(this.ventaDetalles[indice].producto);
                this.calcularTotal();
                //   this.traerdescuentoImporte();
                this.cantidad = 1;
                // this.ordenarNroItem();
                Swal.close();
              } else {
                Swal.close();
                this.invalido('El producto no tiene precio');
              }
            });
          break; // es mejor romper el ciclo si ya se encontro el producto
        }// fin if
      }// fin for
      if (bandera === true) { // no existe.. entonces se agrega
        this._precioMaterialServices.findByPrecioCostoActual(
          producto.codProductoErp,
          this.user.codSucursalErp)
          .subscribe((precioMaterial: PrecioMaterial) => {

            if (precioMaterial) {
              /********************************************Stock************************************ */
              if (producto.inventariable == true) {
                console.log('STOCK', stock);
                let stockDisponible = stock.existencia - stock.comprometido;
                let nuevoStockComprometido = stock.comprometido;
                if (this.cantidad <= stockDisponible) {
                  nuevoStockComprometido = nuevoStockComprometido + this.cantidad;
                  stock.comprometido = nuevoStockComprometido;
                  this.setStock(stock);
                  console.warn('STOCK', stock);
                }
                if (this.cantidad > stockDisponible) {
                  this.cantidad = 1;
                  this.invalido('El producto no tiene stock disponible');
                  return;
                }
              }
              /********************************************Stock************************************ */
              let iva = 0;
              let importeIva = 0;
              let importeIva5 = 0;
              let importeIva10 = 0;
              let importeIvaExenta = 0;
              let total = (precioMaterial.precioCosto * this.cantidad);
              let importeDescuento = 0;
              let importeIVA = Math.round((total * 10) / 100);
              let importeTotal = Math.round(total - importeDescuento);
              importeTotal = importeTotal + importeIVA;
              switch (producto.iva) {
                case 0: {
                  importeIva5 = 0;
                  importeIva10 = 0;
                  importeIvaExenta = importeTotal;
                  importeIva = 0;
                  iva = 0;
                } break;
                case 5: {
                  iva = 5;
                  importeIva5 = Math.round(importeTotal / 21);
                  importeIva = Math.round(importeTotal / 21);
                  importeIva10 = 0;
                  importeIvaExenta = 0;
                } break;
                case 10: {
                  if (producto.ivaEspecial == true) {
                    importeIvaExenta = Math.round(importeTotal / 2.1);
                    let gravada = Math.round(importeIvaExenta * 1.1);
                    importeIva10 = Math.round(gravada / 11);
                    importeIva5 = 0;
                    iva = 10;
                    importeIva = Math.round(gravada / 11);
                  } else {
                    iva = 10;
                    importeIva10 = Math.round(importeTotal / 11);
                    importeIva = Math.round(importeTotal / 11);
                    importeIva5 = 0;
                    importeIvaExenta = 0;
                  }
                } break;
                default:
                  break;
              }
              let detalleVenta: VentaDetalle;
              detalleVenta = {
                'codVentaDetalle': null,
                'nroItem': this.ventaDetalles.length + 1,
                'cantidad': this.cantidad,
                'importeDescuento': importeDescuento,
                'importeIva5': importeIva5,
                'importeIva10': importeIva10,
                'importeIvaExenta': importeIvaExenta,
                'importeNeto': Math.round(importeTotal - importeIva),
                'importePrecio': precioMaterial.precioCosto,
                'importeTotal': importeTotal,
                'subTotal': total,
                'totalKg': (this.cantidad * producto.peso),
                'porcDescuento': 0,
                'porcIva': iva,
                'producto': producto,
                'unidadMedida': unidadDetalle,
                'venta': null,
                'vendedor': this.vendedor,
                'codVendedorErp': this.vendedor.codVendedorErp,
                'tipoDescuento':'NiNGUNO'
              };

              this.notificacionProducto(producto);
              this.ventaDetalles.push(detalleVenta);
              this.cantidad = 1;
              this.calcularTotal();
              Swal.close();
            } else {
              Swal.close();
              Swal.fire('Atención', 'El producto no tiene precio', 'warning');
              return;
            }// fin if
          });
      }// fin if
    } else {
      Swal.close();
      this.invalido('Cantidad no puede ser 0');
    }
  }

  getPrecioIvaInculido(precioMaterial: PrecioMaterial, iva: number): Promise<number> {
    return new Promise<number>(async (resolve) => {
      let precioIvaIncluido: number = 0;
      if (precioMaterial) {
        switch (iva) {
          case 0: {
            precioIvaIncluido = precioMaterial.precioCosto;
          } break;
          case 5: {
            precioIvaIncluido = precioMaterial.precioCosto + Math.round((precioMaterial.precioCosto * 5) / 100);
          } break;
          case 10: {
            precioIvaIncluido = precioMaterial.precioCosto + Math.round((precioMaterial.precioCosto * 10) / 100);
          } break;
          default:
            break;

        }
      }

      resolve(precioIvaIncluido);
    });
  }

  calcularTotal() {
    console.log('////////////////////////////********************////////////////////////');
    console.log(this.ventaDetalles);
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
    this.ventaDetalles.forEach(detalle => {
      this.calculoTotalCantidad = this.calculoTotalCantidad + detalle.cantidad;
      this.venta.subTotal = this.venta.subTotal + detalle.subTotal;
      this.venta.importeIva5 = this.venta.importeIva5 + detalle.importeIva5;
      this.venta.importeIva10 = this.venta.importeIva10 + detalle.importeIva10;
      this.venta.importeIvaExenta = this.venta.importeIvaExenta + detalle.importeIvaExenta;
      if (detalle.porcDescuento == 0) { // si el producto no tiene descuento de tipo producto
        if (detalle.producto.sinDescuento == true) {
          // para calcular detalle de producto no descontable
          detalle.importeDescuento = 0;
        } else {
          this._importeDescontable = this._importeDescontable + detalle.subTotal;
        }
        this.venta.importeDescuento = this.venta.importeDescuento + detalle.importeDescuento;
      } else { // si el producto tiene descuento de tipo producto
        this.venta.importeDescuento = this.venta.importeDescuento + 0;
      }
      this.venta.totalKg = this.venta.totalKg + detalle.totalKg;
      this.venta.importeNeto = this.venta.importeNeto + detalle.importeNeto;
      this.venta.importeTotal = this.venta.importeTotal + detalle.importeTotal;
    });
    console.log('********* Total totalCantidad:', this.calculoTotalCantidad);
    console.log('********* PorcentajeDescuento:', this.porcentajeDescuento);
    console.log('********* Total totalneto:', this.venta.importeNeto);
    console.log('********* Total totalImporteIva5:', this.venta.importeIva5);
    console.log('********* Total totalImporteIva10:', this.venta.importeIva10);
    console.log('********* Total totalimporteIvaExenta:', this.venta.importeIvaExenta);
    console.log('********* Total total Descuento:', this.venta.importeDescuento);
    console.log('********* Total totalimporte:', this.venta.importeTotal);
    console.log('********* Total importeDescontable:', this._importeDescontable);
    console.log('********* Total total a pagar:', Math.round(this.venta.importeTotal));
    return true;
  }

  notificacionDescuento(producto: Producto) {
    this.toastr.info(producto.nombreProducto, 'tiene descuento producto!',
      { timeOut: 150 });
  }
  notificacionSinDescuento(producto: Producto) {
    this.toastr.error(producto.nombreProducto, 'NO tiene descuento producto!',
      { timeOut: 150 });
  }

  notificacionProducto(producto: Producto) {
    this.toastr.success(producto.nombreProducto, 'se agrego nuevo producto!',
      { timeOut: 1500 });
  }

  quitarCobranza(item: CobranzaDetalle) {
    this.totalAbonado = (this.totalAbonado - item.importeAbonado);
    let indice = this.cobranzasDetalle.indexOf(item);
    this.cobranzasDetalle.splice(indice, 1);
    if (this.cobranza.importeCobrado >= this.totalAbonado) {
      this.vuelto = 0;
    } else {
      this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
    }
    console.log(this.totalAbonado);
    console.log(this.vuelto);
  }
  quitarDescuento(descuento: Descuento) {
    console.log(descuento)
    if (descuento.tipoDescuento == 'SUCURSAL') {
      this._tieneDescuentoSucursal = false;
    }
    let indice = this.descuentos.indexOf(descuento);
    this.porcentajeDescuento = (this.porcentajeDescuento - descuento.descuento);
    this.descuentos.splice(indice, 1);

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
      console.warn('STOCK', stock);
      let nuevoStockComprometido = stock.comprometido - item.cantidad;
      stock.comprometido = nuevoStockComprometido;
      this.setStock(stock);
    }
    /********************************************Stock************************************ */
    let existe = 'falso';
    let indice = 0;
    for (let i = 0; i < this.descuentos.length; i++) {
      if (this.descuentos[i].tipoDescuento === 'PRODUCTO') {
        console.log('descuento de tipo producto');
        if (this.descuentos[i].producto.codProducto === item.producto.codProducto) {
          existe = 'verdadero';
          indice = i;
          break;
        }
      }
    }
    if (existe === 'verdadero') {
      this.porcentajeDescuento = this.porcentajeDescuento - this.descuentos[indice].descuento;
      this.descuentos.splice(indice, 1);
      let index = this.ventaDetalles.indexOf(item);
      this.ventaDetalles.splice(index, 1);
    } else {
      let index = this.ventaDetalles.indexOf(item);
      this.ventaDetalles.splice(index, 1);
    }
    this.calcularTotal();
    this.ordenarNroItem();
  }



  ordenarNroItem() {
    for (let i = 0; i < this.ventaDetalles.length; i++) {
      this.ventaDetalles[i].nroItem = i + 1;
    }
  }

  cambiarValor(valor: number) {
    if (this.cantidad <= 0 && valor < 0) {
      this.cantidad = 0;
      return;
    }
    this.cantidad = this.cantidad + valor;
  }
  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 1500 });
    Swal.fire('Atención', invalido, 'warning');
  }


  agregarCobranza() {
    if (this.montoAbonado < 100) { //  SI MONTO ES MENOR A 100
      this.invalido('Monto de cobranza no puede ser menor a 100 Gs.');
      return;
    }
    if (!this.obsequio) { // SI NO SE SELECCIONA MEDIO PAGO
      this.invalido('Medio pago no puede ser nulo');
      return;
    }

    this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
    if (this.codCobranzaDetalle === 0) {
      this.codCobranzaDetalle = 1;
    }
    console.log('agregar cobranza');
    let detalleCobranza: CobranzaDetalle;
    detalleCobranza = {
      'codCobranzaDetalle': this.codCobranzaDetalle,
      'importeAbonado': this.montoAbonado,
      'importeCobrado': 0,
      'saldo': 0,
      'medioPago': this.obsequio,
      'tipoMedioPago': null,
      'fechaEmision': this.fechaEmision,
      'fechaVencimiento': this.fechaVencimiento,
      'nroRef': null,
      'banco': null,
      'nroCuenta': null
    };
    this.codCobranzaDetalle = this.codCobranzaDetalle + 1;
    let bandera: boolean = true;

    for (let indice = 0; indice < this.cobranzasDetalle.length; indice++) {
      console.log('agregar cobranza');
      console.log(this.cobranzasDetalle[indice]);
      if (this.cobranzasDetalle[indice].medioPago.codMedioPago === detalleCobranza.medioPago.codMedioPago) {
        console.log('existe.. entonces se aumenta');
        this.cobranzasDetalle[indice].importeAbonado = (this.cobranzasDetalle[indice].importeAbonado + detalleCobranza.importeAbonado);
        this.cobranzasDetalle[indice].importeCobrado = (this.cobranzasDetalle[indice].importeCobrado + detalleCobranza.importeCobrado);
        this.cobranzasDetalle[indice].saldo = (this.cobranzasDetalle[indice].saldo + detalleCobranza.saldo);
        this.totalAbonado += detalleCobranza.importeAbonado;
        this.cobranza.importeCobrado = Math.round(this.venta.importeTotal);
        this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
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
      this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
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

  /* cambioMedio(medio: MedioPago) {
  this.selectModelMedio = medio;
  console.log('event medio pago ', medio);
  this.montoAbonado = 0;
  this.selectModelBanco = null;
  this.fechaEmision = null;
  this.fechaVencimiento = null;
  this.nroCuenta = null;
  this.nroRef = null;
  } */
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

    this.router.navigate(['/obsequios/page', 0]);
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
            $('#inputDebounce').val('');
            document.getElementById('inputDebounce').focus();
          }
        }
        if (this.inputProducto) {
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


  async restarProducto(item: VentaDetalle) {
    if (item.cantidad === 1) {                                                                 // == Si existe un solo producto
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
        console.warn('STOCK', stock);
        let nuevoStockComprometido = stock.comprometido;
        nuevoStockComprometido = nuevoStockComprometido - 1;
        stock.comprometido = nuevoStockComprometido;
        this.setStock(stock);
        console.warn('STOCK', stock);
      }
      /********************************************Stock************************************ */                                                             // == Si existe mas de un solo producto
      let indice = this.ventaDetalles.indexOf(item);                                                    // traer indice
      this.ventaDetalles[indice].cantidad = (this.ventaDetalles[indice].cantidad - 1);
      this.ventaDetalles[indice].totalKg = (this.ventaDetalles[indice].cantidad * this.ventaDetalles[indice].producto.peso);
      this.ventaDetalles[indice].subTotal = this.ventaDetalles[indice].importePrecio * this.ventaDetalles[indice].cantidad;
      let importeIVA = Math.round((this.ventaDetalles[indice].subTotal * 10) / 100);
      this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].importePrecio * this.ventaDetalles[indice].cantidad;
      this.ventaDetalles[indice].importeTotal = this.ventaDetalles[indice].importeTotal + importeIVA;
      switch (this.ventaDetalles[indice].porcIva) {
        case 0: {
          this.ventaDetalles[indice].importeIva5 = 0;
          this.ventaDetalles[indice].importeIva10 = 0;
          this.ventaDetalles[indice].importeIvaExenta = this.ventaDetalles[indice].importeTotal;
          this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal;
        } break;
        case 5: {
          this.ventaDetalles[indice].importeIva5 = Math.round(this.ventaDetalles[indice].importeTotal / 21);
          this.ventaDetalles[indice].importeIva10 = 0;
          this.ventaDetalles[indice].importeIvaExenta = 0;
          this.ventaDetalles[indice].importeNeto = this.ventaDetalles[indice].importeTotal - this.ventaDetalles[indice].importeIva5;
        } break;
        case 10: {
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
        } break;
        default:
          break;
      }
      this.calcularTotal();
    }


  }

  validarPorcentaje() {
    console.log(this.porcentajeDescuento);
    console.log(this.limitePorcentajeDescuento);
    if (this.porcentajeDescuento > this.limitePorcentajeDescuento) {
      Swal.fire({
        title: 'Está seguro?',
        text: `¿Seguro que desea  cerrar la venta con el porcentaje de descuento mayor a ` + this.limitePorcentajeDescuento + `% ?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, pasar a cobranza!',
        cancelButtonText: 'No, cancelar!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.cerrarObsequio();
        }

      });
    } else {
      this.cerrarObsequio();
    }
  }

  cerrarObsequio() {
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

    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea cerrar el obsequio ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ver ticket!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.pagoNoContado();
      }

    });
  }

  pagoNoContado() {
    this.venta.cliente = this.cliente;
    console.log(this.ventaDetalles);
    this.calcularTotal();
    for (let i = 0; i < this.descuentos.length; i++) {
      if (this.descuentos[i]) { // cargo los descuentos
        let ventaDescuento: VentaDescuento;
        ventaDescuento = {
          'codDescuento': this.descuentos[i].codDescuento,
          'codVenta': null,
          'codVentaDescuento': null
        };
        this.ventaDescuento.push(ventaDescuento);
      }
    }
    this.venta.cobranza = null;
    this.venta.vendedor = this.vendedor;
    this.venta.codVendedorErp = this.vendedor.codVendedorErp;
    this.venta.listaPrecio = this.cliente.listaPrecio;
     this.venta.porcDescuento = this.porcentajeDescuento;
    this.venta.detalle = this.ventaDetalles;
    this.venta.formaVenta = this.cliente.formaVentaPref;
    let objeto = {
      'venta': this.venta,
      'descuentos': this.ventaDescuento
    };
    console.log('enviado ..', objeto);
    this._ventasServices.cerrarVenta(objeto).subscribe((resp: any) => {
      let venta = resp.venta as Venta;
      console.log(venta.codVenta);
      if (venta.tipoComprobante == 'FACTURA') {
        this.verTicketPdf(venta.codVenta);
        this.limpiar();
      } else {
        this.router.navigate(['/ticketVenta/id/', venta.codVenta]);
      }

    });
  }

  verTicketPdf(venta: number) {
    this._ventasServices.verTicketPdf(venta, '').subscribe((response: any) => {
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }

  mostrarModal() {
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
    this.medioPago.splice(0, this.medioPago.length);
    this._medioPagoServices.getObsequio(this.user.codEmpresa, true).subscribe(medioPago => {

      this.obsequio = medioPago;
      this.medioPagoLabel = this.obsequio.descripcion;
      console.log('jhidhnfgdesushdfuhsdufdshfudsfhdsu', this.selectModelMedio)
      this.venta.cliente = this.cliente;
      this.venta.formaVenta = this.cliente.formaVentaPref;
      this.oculto = '';
      this.totalAbonado = 0;
      this.seleccionMedioPago = null;
      this.iniciarCobranza();
      this.cobranza.importeCobrado = Math.round(this.venta.importeTotal);
      this.oculto = '';
      this.ordenarNroItem();
    });

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


  guardarCobranza() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    let montoCobrandoCab = this.venta.importeTotal;
    this.cobranzasDetalle.forEach(detalleCobranza => {
      if (montoCobrandoCab > detalleCobranza.importeAbonado) {
        detalleCobranza.importeCobrado = detalleCobranza.importeAbonado;
        montoCobrandoCab = Math.round(montoCobrandoCab - detalleCobranza.importeAbonado);
        detalleCobranza.saldo = Math.round(detalleCobranza.importeAbonado - detalleCobranza.importeCobrado);
      } else if (montoCobrandoCab == detalleCobranza.importeAbonado) {
        detalleCobranza.importeCobrado = detalleCobranza.importeAbonado;
        montoCobrandoCab = Math.round(montoCobrandoCab - detalleCobranza.importeAbonado);
        detalleCobranza.saldo = Math.round(detalleCobranza.importeAbonado - detalleCobranza.importeCobrado);
      } else if (montoCobrandoCab < detalleCobranza.importeAbonado) {
        detalleCobranza.importeCobrado = montoCobrandoCab;
        Math.round(detalleCobranza.importeAbonado - montoCobrandoCab);
        detalleCobranza.saldo = Math.round(detalleCobranza.importeCobrado - detalleCobranza.importeAbonado);
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
      if (this.descuentos[i]) { // cargo los descuentos
        let ventaDescuento: VentaDescuento;
        ventaDescuento = {
          'codDescuento': this.descuentos[i].codDescuento,
          'codVenta': null,
          'codVentaDescuento': null
        };
        this.ventaDescuento.push(ventaDescuento);
      }
    }
    /*********      cargar cobranzas       ****** */
    this.cobranza.importeAbonado = this.totalAbonado;
    this.cobranza.saldo = (this.cobranza.importeCobrado - this.totalAbonado);
    this.cobranza.detalle = null;
    this.cobranza.detalle = this.cobranzasDetalle;
    /*********      cargar ventas         ****** */
    this.venta.cobranza = this.cobranza;
    this.venta.porcDescuento = this.porcentajeDescuento;
    this.venta.detalle = null;
    this.venta.pedido = null;
    this.venta.detalle = this.ventaDetalles;
    let objeto = {
      'venta': this.venta,
      'descuentos': this.ventaDescuento
    };
    console.log('enviado ..', objeto);
    this._ventasServices.cerrarVenta(objeto).subscribe((resp: any) => {
      Swal.close();
      let venta = resp.venta as Venta;
      console.log(venta.codVenta);
      console.log('/ticketVenta/id/', venta.codVenta);
      this.router.navigate(['/ticketVenta/id/', venta.codVenta]);
      /*       this.cerrarModal();
       */
      /*  const fileURL = URL.createObjectURL(resp);
       window.open(fileURL, '_blank');
       console.log(resp); */
      /*  Swal.fire('Cobranza registrada', 'Cobranza realizada exitosamente', 'success' ); */
    });
  }


  iniciarCobranza() {
    this.cobranza = {
      'anulado': false,
      'codCobranza': null,
      'importeCobrado': 0,
      'importeAbonado': 0,
      'fechaCobranza': moment(new Date()).format('YYYY-MM-DD'),
      'saldo': 0,
      'detalle': null,
      'tipo': 'VENTA'
    };
  }

  async iniciarCabecera() {
    this.venta = {
      'codVenta': null,
      'anulado': false,
      'codEmpresaErp': this.user.codEmpresaErp,
      'codSucursalErp': this.user.codSucursalErp,
      'codEmpresa': this.user.codEmpresa,
      'codSucursal': this.user.codSucursal,
      'estado': 'TEMP',
      'modoEntrega': 'CONTRA_ENTREGA',
      'fechaAnulacion': null,
      'fechaCreacion': null,
      'fechaVencimiento': null,
      'fechaVenta': moment(new Date()).format('YYYY-MM-DD'),
      'fechaModificacion': null,
      'porcDescuento': 0,
      'importeDescuento': 0,
      'importeIva5': 0,
      'importeIva10': 0,
      'importeIvaExenta': 0,
      'importeNeto': 0,
      'importeTotal': 0,
      'descuentoProducto': 0,
      'subTotal': 0,
      'totalKg': 0,
      'timbrado': '',
      'inicioTimbrado': '',
      'finTimbrado': '',
      'codUsuarioAnulacion': null,
      'nroComprobante': '',
      'tipoComprobante': '',
      'terminalVenta': this.terminal,
      'deposito': this.deposito,
      'cobranza': null,
      'codUsuarioCreacion': this.user.codUsuario,
      'cliente': this.cliente,
      'pedido': null,
      'formaVenta': this.cliente.formaVentaPref,
      'detalle': null,
      'motivoAnulacion': null,
      'esObsequio': true,
      'editable': false,
      'vendedor': null,
      'codVendedorErp': null,
      'listaPrecio': null,
      'tipoVenta': 'POS',
      'cupon': null,
      'canal': null,
    };
    console.log(this.venta);
  }
async getCanalPrincipal() {
    let canal = this._canalServices.getCanal().toPromise();
    return canal;
  }
  async limpiar() {
    this.cancelarStockComprometido(this.deposito.codDeposito, this.ventaDetalles);
    console.log('LIMPIAR();');
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
    this.ventaDescuento.splice(0, this.ventaDetalles.length);
    this.ventaDetalles.splice(0, this.ventaDetalles.length);
    this.cobranzasDetalle.splice(0, this.cobranzasDetalle.length);
    this.descuentos.splice(0, this.descuentos.length);
    this.clientes.splice(0, this.clientes.length);
    this.productos.splice(0, this.productos.length);
    this.iniciarCabecera();
   this.venta.canal= await this.getCanalPrincipal(); // esperar el canal primero
    this.iniciarCobranza();
    this.nroRef = '';
    this.categoriaSeleccionada = this.categoriaTodos;
    this.ngOnInit();
  }




  async buscarUnidadMedida(producto) {
    for await (const listaPrecio of this.listasPrecio) {
      let precio: Precio = await this.getPrecio(1, producto.codProducto, listaPrecio.codListaPrecio, this.cliente.codCliente);
      if (precio) {
        return precio.unidadMedida;
      }
    }
    return null;
  }
  /****************************verificar cliente******************************* */
  async getVendedorByCodUser() {
    let vendedor = this._vendedorServices.getByCodUser(this._loginServices.user.codUsuario).toPromise();
    return vendedor;
  }
  async getPrecio(cantidad: number, codProducto: number, codListaPrecio: number, codCliente: number) {
    let precio = this._precioServices.traerPrecio(cantidad, codProducto, codListaPrecio, codCliente).toPromise();
    return precio;
  }

  async getListaPrecio() {
    let listaPrecio = this._listaPrecioServices.traerListaPrecio(this._loginServices.user.codEmpresa)
      .toPromise();
    return listaPrecio;
  }

  async cancelarStockComprometido(codDeposito, detalles) {
    let detall = this._stockServices.cancelarComprometido(
      codDeposito,
      detalles)
      .toPromise();
    return detall;
  }

  async getCategorias() {
    let categorias = this._categoriaService.traerCategoria(this._loginServices.user.codEmpresa).toPromise();
    return categorias;
  }

  filtrarCategoria(categoria: CategoriaProducto) {
    if (categoria) {
      this.categoriaSeleccionada = categoria;
      this.traerProductos(0, this.busqueda, this.categoriaSeleccionada.codCategoriaProducto);
    } else {
      this.traerProductos(0, this.busqueda, 0);
    }
  }


  /*********************************Seccion terminal*************************** */
  cerrarModalTerminal() {
    this.modalTerminal = 'oculto';
    this.router.navigate(['/dashboard']);
  }

  usar(monto) {
    this.montoAbonado = monto;
  }
  cambioTerminal(event) {
    for (let indice = 0; indice < this.terminales.length; indice++) {           // tslint:disable-next-line:triple-equals
      if (this.terminales[indice].codTerminalVenta == this.seleccionTerminal) {
        this.terminal = this.terminales[indice];
      }
    }
  }



  guardarTerminal() {
    for (let indice = 0; indice < this.terminales.length; indice++) {         // tslint:disable-next-line:triple-equals
      if (this.terminales[indice].codTerminalVenta == this.seleccionTerminal) {
        this.terminal = this.terminales[indice];
        this.terminal.id = UUID.UUID();
        //  let encodedData = window.btoa(JSON.stringify(this.terminal)); // encode a string
        // let decodedData = window.atob(encodedData); // decode the string



        /*  this._terminalServices.update(this.terminal)
         .subscribe(
          ( json: Terminales) => { */
        localStorage.setItem('tv', window.btoa(JSON.stringify(this.terminal)));
        Swal.fire('Terminal Registrada', `Terminal: ${this.terminal.descripcion} registrada con exito`, 'success');
        this.ngOnInit();
        this.modalTerminal = 'oculto';
        /* },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
            this.errores = err.error.errors;
            console.log('Código del error desde el backend: ' + err.status);
        }
      ); */
      }
    }
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }
  /***************************************************************************************** */
}
