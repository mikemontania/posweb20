import { CategoriaService } from './../../services/categoria/categoria.service';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Descuento } from '../../models/descuento.model';
import { Cliente } from '../../models/cliente.model';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PremioService, ClienteService, SucursalesService, CanjesService, StockPremioService } from '../../services/service.index';

import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { User } from '../../models/user.model';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/service.index';
import { ErrModel } from '../../models/ErrModel.model';
import { Sucursal } from '../../models/sucursal.model';
import { InputDebounceComponent } from '../../components/inputDebounce/inputDebounce.component';
import { Premio } from '../../models/premio.model ';
import { CanjeDet } from '../../models/canjeDet.model';
import { Canje } from '../../models/canje.model';
import { StockPremio } from 'src/app/models/stockPremio.model';


@Component({
  selector: 'app-canjes',
  templateUrl: './canjes.component.html',
  styleUrls: ['./canjes.component.css']
})
export class CanjesComponent implements OnInit {

  /* ===========ARRAYS=================== */
  paginas = [];
  premios: Premio[] = [];
  descuentos: Descuento[] = [];
  canjeDetalle: CanjeDet[] = [];
  detallesAux: CanjeDet[] = [];
  clientes: Cliente[] = [];
  /* ===========objetos=================== */
  itemDescuento: Descuento;
  user: User;
  selectModelCliente: Cliente;
  cliente: Cliente;
  listaPrecio: ListaPrecio;
  paginador: any;
  canje: Canje;
  canjeDetAux: CanjeDet;
  /* ===========string=================== */
  textoBusqueda = '';
  fechaEmision: string;
  fechaVencimiento: string;
  token: string;
  nroRef: string;
  nroCuenta: string;
  oculto = 'oculto';
  modalCliente = 'oculto';
  busqueda = '';
  rutaPaginador = '/canjes/page';
  razonSocial: string;
  sinImagen = './assets/images/sin-imagen.jpg';
  img = './assets/images/jabon.png';
  size = 'md';
  /* searchModelPremio: any = ''; */
  /* ===========boolean=================== */
  msgAdvertencia = false;
  deshabilitarBuscador = true;
  cargando = false;
  mostrarCliente = false;
  mostraCantidad = false;
  mostrarForm = false;
  excIva = false;
  ellipses = false;
  /* ===========number=================== */
  puntosDesde = 0;
  puntosHasta = 99999999;
  totalElementos = 0;
  cantidadElementos = 0;
  pagina = 0;
  totalAbonado = 0;
  totalSaldo = 0;
  importeDescontable = 0;
  cantidad = 1;
  montoAbonado = 0;
  vuelto = 0;
  calculoTotalCantidad = 0;
  nrocanje = 0;
  /***************mask*********** */
  errores: ErrModel[] = [];

  /* ===========objetos=================== */
  sucursal: Sucursal;
  premioAux: Premio;
  client: Cliente;

  /* ===========string=================== */
  fechaInicio: string;
  fechaFin: string;
  modalcanjes = 'oculto';
  tamanhoPag = 'md';
  /* searchModelPremio: any = ''; */
  /* ===========boolean=================== */

  autorizado = false;
  esContado = false;

  /* ===========number=================== */
  seleccionTerminal: number;
  pageSizePed = 0;
  totalElementosPed = 0;
  seleccionFormaVenta = 0;
  codCobranzaDetalle = 0;
  paginacanje = 0;
  /***************mask*********** */
  @ViewChild('inputPremio') inputPremio: InputDebounceComponent;

  constructor(
    private toastr: ToastrService,
    private location: Location,
    public router: Router,
    public http: HttpClient,
    public _stockPremioServices: StockPremioService,
    public sucursalServices: SucursalesService,
    public premiosServices: PremioService,
    public clientesServices: ClienteService,
    public loginServices: LoginService,
    public empresaServices: EmpresasService,
    private activatedRoute: ActivatedRoute,
    public canjeServices: CanjesService,
    public categoriaService: CategoriaService,
  ) { }

  // Agregamos un HostListener para escuchar el evento beforeunload del navegador
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Verificamos si hay detalles de canje en canjeDetalle
    if (this.canjeDetalle && this.canjeDetalle.length > 0) {
      // Llamamos a la función para cancelar el stock comprometido antes de abandonar la página
      this.cancelarStockComprometido(this.loginServices.user.codSucursal, this.canjeDetalle);
    }
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges() {
    this.min();
    this.razonSocial = this.cliente.razonSocial;
  }

  ngOnInit() {
    this.canjeDetAux = null;
    this.min();
    this.deshabilitarBuscador = true;
    this.router.navigate(['/canjes/page', 0]);
    this.user = this.loginServices.user;
    /*==========Observa la paginación =======================*/
    this.activatedRoute.paramMap.subscribe(params => {
      let page = +params.get('page');
      if (!page) {
        page = 0;
      }
      this.traerPremios(page, this.busqueda, 1, 999999999);
    });
    /*=====================================================*/
    this.cargar(); // se llama a varios servicios para iniciar objetos empreesa,clientes, mediopago ect
  }

  canjeInit() {
    console.log(this.user);
    this.canje = {
      codCanje: null,
      anulado: false,
      codEmpresaErp: this.user.codEmpresaErp,
      codSucursalErp: this.user.codSucursalErp,
      codEmpresa: this.user.codEmpresa,
      codSucursal: this.user.codSucursal,
      estado: 'TEMP',
      fechaAnulacion: null,
      fechaCreacion: null,
      fechaCanje: moment(new Date()).format('YYYY-MM-DD'),
      fechaModificacion: null,
      puntos: 0,
      nroCanje: null,
      codUsuarioAnulacion: null,
      codUsuarioCreacion: this.user.codUsuario,
      cliente: this.cliente,
      detalle: this.canjeDetalle,
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
    // if (!this.listaPrecio) {
    //   this.router.navigate(['/dashboard']);
    //   this.invalido('El Cliente no posee lista de precio');
    // }
    this.canjeInit();
    console.log('cliente DEFAULT :', this.cliente);
    this.mostrarCliente = true;
    this.deshabilitarBuscador = false;
    this.traerPremios(0, this.busqueda, 1, 999999999);
  }


  setStock(stock) {
    this._stockPremioServices.update(stock).subscribe((res) => console.log('*********stock alterado'));
  }

  async seleccionarPremio(premio: Premio) {
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
    let stock: StockPremio = null;
    if (premio.inventariable == true) {
      stock = await this.getStock(premio.codPremio);
      if (!stock) {
        this.invalido('EL PREMIO INVENTARIABLE NO POSEE STOCK');
        return;
      } 
      if (stock.existencia <= 0) {
        this.invalido('EL PREMIO INVENTARIABLE NO POSEE STOCK');
        return;
      }
      console.log('STOCK', stock);
    }
    let indice = 0;
    indice = this.canjeDetalle.findIndex((d) => d.premio.codPremio == premio.codPremio);
    // =========== ==============     si no existe en el array ==================
    if (indice == -1) {
      let canjeDet: CanjeDet;
      let totalPuntos = (premio.puntos * this.cantidad)
      canjeDet = {
        codCanjeDet: null,
        cantidad: this.cantidad,
        puntos: premio.puntos,
        totalPuntos: totalPuntos,
        premio: premio,
        canje: null
      };

      this.canjeDetalle.push(canjeDet);
      // =========== ========================  si ya existe en el array ==================
    } else {
      this.canjeDetalle[indice].cantidad = this.canjeDetalle[indice].cantidad + this.cantidad;
      this.canjeDetalle[indice].totalPuntos = (this.canjeDetalle[indice].cantidad * this.canjeDetalle[indice].puntos);
    }
    if (premio.inventariable == true) {
      console.log('STOCK', stock);
      let stockDisponible = stock.existencia - stock.comprometido;
      let nuevoStockComprometido = stock.comprometido;
      if (this.cantidad > stockDisponible) {
        this.canjeDetalle[indice].cantidad = this.canjeDetalle[indice].cantidad - this.cantidad;
        if (this.canjeDetalle[indice].cantidad <= 0) {
          this.canjeDetalle.splice(indice, 1);
        }
        this.cantidad = 1;
        this.invalido('El premio no tiene stock disponible');
        return;
      }
      if (this.cantidad <= stockDisponible) {
        nuevoStockComprometido = nuevoStockComprometido + this.cantidad;
        stock.comprometido = nuevoStockComprometido;
        this.setStock(stock);
      }
    }
    /********************************************Stock************************************ */

    this.cantidad = 1;
    Swal.close();
    let a = await this.sumarPuntos();

  }

  async seleccionarCliente(item: Cliente) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    this.canjeInit(); // no importa en que tiempo se ejecute mientras exista cliente default
    this.cliente = item;
    if (this.cliente) {
      if (this.cliente) {
        this.razonSocial = this.cliente.concatDocNombre;
        this.listaPrecio = this.cliente.listaPrecio;
      } else {
        this.cliente = null;
        this.invalido('Canje no permitido para funcionarios');
      }
      if (!this.listaPrecio) {
        this.router.navigate(['/dashboard']);
        this.invalido('El Cliente no posee lista de precio');
      }



      this.mostrarCliente = true;
      this.deshabilitarBuscador = false;
      this.traerPremios(0, this.busqueda, 1, 999999999);
      if (localStorage.getItem('detalles')) {
        /***Si existe en el localStorage ******/
        this.canjeDetalle = JSON.parse(window.atob(localStorage.getItem('detalles')));;
        localStorage.removeItem('detalles');
      }
      if (this.canjeDetalle.length > 0) {
        /***Si existe canje ******/
        console.log(' /***Si existe canje ******/');
      }
    }
    Swal.close();
    let a = await this.sumarPuntos();
  }

  cambiarCliente() {
    this.deshabilitarBuscador = true;
    this.codCobranzaDetalle = 0;
    this.oculto = 'oculto';
    this.cargando = false;
    this.paginas.length = 0;
    this.calculoTotalCantidad = 0;
    this.totalElementos = 0;
    this.cantidadElementos = 0;
    this.totalAbonado = 0;
    this.cantidad = 1;
    this.montoAbonado = 0;
    this.vuelto = 0;
    this.seleccionFormaVenta = 0;
    this.canjeDetalle.splice(0, this.canjeDetalle.length);
    this.descuentos.splice(0, this.descuentos.length);
    this.clientes.splice(0, this.clientes.length);
    this.premios.splice(0, this.premios.length);
    this.nroRef = '';
    $('#typeahead-http').val('');
    this.mostrarCliente = false;
    this.canjeInit();
  }

  async quitarPremioCompleto(item: CanjeDet) {
    /********************************************Stock************************************ */
    let stock: StockPremio = null;
    if (item.premio.inventariable == true) {
      stock = await this.getStock(item.premio.codPremio);
      if (!stock) {
        this.invalido(+item.premio.codPremio + ' INVENTARIABLE NO POSEE STOCK ');
        return;
      }
      console.log('STOCK', stock);
      let nuevoStockComprometido = stock.comprometido - item.cantidad;
      stock.comprometido = nuevoStockComprometido;
      this.setStock(stock);
    }
    /********************************************Stock************************************ */

    let index = this.canjeDetalle.indexOf(item);
    this.canjeDetalle.splice(index, 1);

    let a = await this.sumarPuntos();
  }


  cambioCliente(value: Cliente) {
    console.log(this.clientes);
    this.canjeInit();
    console.log(this.canje);
    this.cargarPremios();
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



  buscarPremio(termino: string) {
    this.router.navigate(['/canjes/page', 0]);
    console.log(' buscarPremio');
    debounceTime(300);
    distinctUntilChanged();
    if (termino.length <= 2) {
      this.busqueda = '';
      this.traerPremios(0, '', this.puntosDesde, this.puntosHasta);
      return;
    }
    this.cargando = true;
    this.busqueda = termino.toUpperCase();
    this.traerPremios(0, termino.toUpperCase(), this.puntosDesde, this.puntosHasta);
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }


  traerPremios(page, termino, puntosDesde, puntosHasta) {
    this.premiosServices.traerPremiosActivosPorPaginas(page, termino, puntosDesde, puntosHasta)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        this.premios = response.content as Premio[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.premios = [];
        } else {
          this.cargando = false;
        }

        if (response) {
          if (response.numberOfElements === 1 && termino.length > 8) {
            const premio: Premio = this.premios[0];
            this.traerPremios(0, '', puntosDesde, puntosHasta);
            // $('#inputDebounce').val('');
            // document.getElementById('inputDebounce').focus();
          }
        }
        if (this.inputPremio) {
          this.inputPremio.inputValue = '';
          this.inputPremio.enfocar();
        }
      });
  }


  cargarPremios() {
    this.premiosServices.traerPremios().subscribe((resp: any) => {
      this.premios = resp.content;
      this.paginador = resp;
      this.paginas = this.premios;
      console.log(this.paginador);
    });
  }

  async restarPremio(item: CanjeDet) {
    if (item.cantidad === 1) {
      // == Si existe un solo premio
      return;
    } else if (item.cantidad > 1) {
      /********************************************Stock************************************ */
      let stock: StockPremio = null;
      if (item.premio.inventariable == true) {
        stock = await this.getStock(item.premio.codPremio);
        if (!stock) {
          this.invalido(+item.premio.descripcion + ' INVENTARIABLE NO POSEE STOCK ');
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

      const indice = this.canjeDetalle.indexOf(item); // traer indice
      this.canjeDetalle[indice].cantidad = this.canjeDetalle[indice].cantidad - 1;
      this.canjeDetalle[indice].totalPuntos = this.canjeDetalle[indice].totalPuntos - this.canjeDetalle[indice].puntos;
    }

    let a = await this.sumarPuntos();
  }

  async sumarPuntos() {
    this.canje.puntos = 0;
    console.log('***********************sumarPuntos*******************');
    for await (const detalle of this.canjeDetalle) {
      this.canje.puntos = this.canje.puntos + detalle.totalPuntos;
      console.log(this.canje.puntos);
    }
    console.log('***********************Fin sumarPuntos *******************');
  }





  cerrarModal() {
    this.oculto = 'oculto';
    this.limpiar();
  }
  cancelarModal() {
    this.oculto = 'oculto';
  }


  guardarcanje() {

    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea guardar el canje ?`,
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Guardar',
      cancelButtonText: 'No, volver al canje',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then(async (result) => {
      if (result.value) {
        if (!this.cliente) {
          this.invalido('No se ha seleccionado ningun cliente!!!');
          return;
        }
        if (this.cliente.predeterminado == true) {
          this.invalido('Cliente Mostrador no puede realizar canje!');
          return;
        }
        if (this.cliente.esPropietario == true) {
          this.invalido('Cliente Propietario no puede realizar canje!');
          return;
        }
        // if (this.cliente.listaPrecio.codListaPrecio == 2) {
        //   this.invalido('Funcionario no puede realizar canje!');
        //   return;
        // }

        if (this.canje.puntos > this.cliente.puntos) {
          this.invalido('Puntaje insuficiente!');
          return;
        }
        if (this.canjeDetalle.length <= 0) {
          this.invalido('No se ha seleccionado premios!');
          return;
        }
        if (!this.cliente) {
          this.invalido('No se ha seleccionado Cliente!!!');
          return;
        }
        let a = await this.sumarPuntos();
        this.canje.fechaCanje = moment(new Date()).format('YYYY-MM-DD');
        this.canje.nroCanje = 0;
        this.canje.cliente = this.cliente;
        this.canje.detalle = this.canjeDetalle;
        console.log(this.canje);
        console.log(this.canjeDetalle);
        Swal.fire({
          allowOutsideClick: false,
          type: 'info',
          text: 'Espere por favor...',
        });
        Swal.showLoading();
        let objeto = {
          canje: this.canje
        };
        console.log('enviado ..', objeto);
        this.canjeServices.realizarCanje(objeto).subscribe((resp: any) => {
          Swal.close();
          console.log(resp);
          Swal.fire('Canje realizado con exito!!!', `El cliente ${this.cliente.concatCodErpNombre} finalizo el canje por ${this.canje.puntos} puntos`, 'success');
          this.limpiar();
        });
      }
    });
  }


  async limpiar() {
    if (this.canjeDetalle && this.canjeDetalle.length > 0) {
      await this.cancelarStockComprometido(this.loginServices.user.codSucursal, this.canjeDetalle)
    }
    this.nrocanje = 0;
    this.canjeDetAux = null;
    this.importeDescontable = 0;
    this.codCobranzaDetalle = 0;
    this.oculto = 'oculto';
    this.cargando = false;
    this.paginas.length = 0;
    this.calculoTotalCantidad = 0;
    this.totalElementos = 0;
    this.totalAbonado = 0;
    this.cantidad = 1;
    this.montoAbonado = 0;
    this.vuelto = 0;
    this.canjeDetalle.splice(0, this.canjeDetalle.length);
    this.descuentos.splice(0, this.descuentos.length);
    this.clientes.splice(0, this.clientes.length);
    this.premios.splice(0, this.premios.length);
    this.canjeInit();
    this.nroRef = '';
    this.ngOnInit();
    this.cargar();
  }

  cerrarModalCliente() {
    this.modalCliente = 'oculto';
  }
  /****************************verificar cliente******************************* */

  mostrarModalCliente() {
    this.modalCliente = '';
  }

  verificarcanje() {
    if (this.canje.puntos > 0) {
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

  async guardarDetalles() {
    let detall = await this.cancelarStockComprometido(
      this.loginServices.user.codSucursal,
      this.canjeDetalle
    )
    let _detallesLocalStorage: CanjeDet[] = [] = this.canjeDetalle;
    localStorage.setItem('detalles', window.btoa(JSON.stringify(_detallesLocalStorage)));
    this.cambiarCliente();

  }
  async cancelarStockComprometido(codDeposito, detalles) {
    let detall = this._stockPremioServices
      .cancelarComprometido(codDeposito, detalles)
      .toPromise();
    return detall;
  }
  async getStock(codPremio: number) {
    let stock = this._stockPremioServices.traerStock(this.loginServices.user.codSucursal, codPremio).toPromise();
    return stock;
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

  cancelarModalcanjes() {
    this.nrocanje = 0;
    this.modalcanjes = 'oculto';
  }
  seleccionCliente(event: Cliente) {
    console.log(event);
    this.client = event;
  }

  // ====================================Seccion ASYNC==================================================

  async getModelcanjesById(codcanje: number) {
    let modelo = this.canjeServices.getById(codcanje)
      .toPromise();
    return modelo;
  }

  async getSucursal() {
    let sucursal = this.sucursalServices.getSucursalbyId(this.loginServices.user.codSucursal).toPromise();
    return sucursal;
  }


  async ClientePredeterminado() {
    let cliente = this.clientesServices.getClienteDefault().toPromise();
    return cliente;
  }

}
