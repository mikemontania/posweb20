import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ProductoService, ClienteService, PrecioService, DescuentoService, BancosService, ProveedorService, TransferenciaService } from '../../services/service.index';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/service.index';
import { DepositoService } from '../../services/deposito/deposito.service';
import { StockService } from '../../services/stock/stock.service';
import { ComprobantesService } from '../../services/comprobantes/comprobantes.service';
import { Transferencia } from '../../models/transferencia.model';
import { TransferenciaDetalle } from '../../models/transferenciaDetalle.model';
import { Deposito } from '../../models/deposito.model';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MotivoTransferencia } from '../../models/motivoTransferencia.model';
import { Stock } from '../../models/stock.model';
@Component({
  selector: 'app-transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.css'],
})
export class TransferenciaComponent implements OnInit {
  transferencia: Transferencia;
  cargadorDepositoEmisor: Deposito;
  cargadorDepositoReceptor: Deposito;
  cargadorMotivoTransferencia: MotivoTransferencia;
  cargadorStock: Stock;
  stockEmisor: Stock;
  stockReceptor: Stock;
  stocksEmisor: Stock[] = [];
  cantidadTransferencia: number;
  emisorInicio: number;
  emisorFin: number;
  receptorInicio: number;
  receptorFin: number;
  disabledEmisor: boolean;
  disabledReceptor: boolean;
  disabledMotivo: boolean;
  mostrarDetalle: boolean;

  constructor(
    private toastr: ToastrService,
    private location: Location,
    public router: Router,
    public http: HttpClient,
    public _productosServices: ProductoService,
    public _comprobanteServices: ComprobantesService,
    public _precioServices: PrecioService,
    public _descuentoServices: DescuentoService,
    public _loginServices: LoginService,
    public _empresaServices: EmpresasService,
    private activatedRoute: ActivatedRoute,
    private _transferenciasServices: TransferenciaService,
    public _depositoServices: DepositoService,
    public _stockServices: StockService
  ) {
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event: Event) {
    this.cancelarStockComprometido(this.cargadorDepositoEmisor.codDeposito, this.transferencia.detalle);
    this.router.navigate(['/transferencias']);
    this._loginServices.accion();
  }
  ngOnInit() {
    this.disabledEmisor = false;
    this.disabledReceptor = false;
    this.disabledMotivo = false;
    this.mostrarDetalle = false;
    this.transferenciaInit();
    this.cargadorDepositoEmisor = null;
    this.cargadorDepositoReceptor = null;
    this.cargadorMotivoTransferencia = null;
    this.cantidadTransferencia = 0;
    this.emisorInicio = 0;
    this.emisorFin = 0;
    this.receptorInicio = 0;
    this.receptorFin = 0;
    this.stockEmisor = null;
  }



  async guardar() {
    if (!this.cargadorDepositoEmisor) {
      this.invalido('Emisor no puede ser null');
      return;
    }
    if (!this.cargadorDepositoReceptor) {
      this.invalido('Receptor no puede ser null');
      return;
    }
    if (!this.cargadorMotivoTransferencia) {
      this.invalido('Motivo no puede ser null');
      return;
    }
    if (!this.transferencia.fecha) {
      this.invalido('Favor completar fecha de transferencia');
      return;
    }

    if (this.transferencia.detalle.length <= 0) {
      this.invalido('Detalles no puede ser null');
      return;
    }
    this.transferencia.totalProducto = this.transferencia.detalle.length;
    this.transferencia.totalTransferencia = this.transferencia.detalle.reduce((sumador, detalle) => sumador + detalle.cantidadTransferencia, 0);
    this.transferencia.anulado = false;
    this.transferencia.depositoEmisor = this.cargadorDepositoEmisor;
    this.transferencia.depositoReceptor = this.cargadorDepositoReceptor;
    this.transferencia.motivoTransferencia = this.cargadorMotivoTransferencia;
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea grabar la transferencia?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, grabar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._transferenciasServices.create(this.transferencia).subscribe(response => {
          Swal.fire('La transferencia se ha registrado con exito !!!', 'Finalizado!!!', 'success');
          this.ngOnInit();
        });
      }
    });
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
  transferenciaInit() {
    this.transferencia = {
      codTransferencia: null,
      anulado: false,
      codEmpresa: this._loginServices.user.codEmpresa,
      codUsuarioCreacion: this._loginServices.user.codUsuario,
      usuario: this._loginServices.user.username,
      fechaCreacion: null,
      fecha: moment(new Date()).format('YYYY-MM-DD'),
      fechaModificacion: null,
      nroComprobante: '',
      depositoEmisor: null,
      depositoReceptor: null,
      motivoTransferencia: null,
      totalProducto: 0,
      totalTransferencia: 0,
      detalle: [],
    }
  }


  async agregarDetalle() {
    if (!this.cargadorDepositoEmisor) {
      this.invalido('Emisor no puede ser null');
      return;
    }
    if (!this.cargadorDepositoReceptor) {
      this.invalido('Receptor no puede ser null');
      return;
    }
    if (!this.cargadorMotivoTransferencia) {
      this.invalido('Motivo no puede ser null');
      return;
    }
    if (this.cargadorDepositoEmisor.codDeposito == this.cargadorDepositoReceptor.codDeposito) {
      this.cargadorDepositoEmisor = null;
      this.cargadorDepositoReceptor = null;
      this.invalido('Depositos emisor y receptor no pueden ser iguales');
      return;
    }
    if (!this.stockEmisor) {
      this.invalido('Seleccione un material a transferir y especifique su cantidad a transferir');
      return;
    }
    if (this.cantidadTransferencia == 0) {
      this.invalido('Cantidad de transferencia debe ser mayor a 0');
      this.cantidadTransferencia = 0;
      return;
    }
    if (this.cantidadTransferencia > this.emisorInicio) {
      this.invalido('el valor de transferencia no puede ser mayor al stock del deposito emisor');
      this.cantidadTransferencia = 0;
      return;
    }
    let detalle: TransferenciaDetalle;
    detalle = {
      codTransferenciaDetalle: null,
      transferencia: null,
      producto: null,
      unidadMedida: null,
      nroItem: 0,
      cantidadTransferencia: 0,
      emisorInicio: 0,
      emisorFin: 0,
      receptorInicio: 0,
      receptorFin: 0
    }
    if (this.cantidadTransferencia <= (this.stockEmisor.existencia - this.stockEmisor.comprometido)) {
      this.stockEmisor.comprometido += this.cantidadTransferencia;
      this.setStock(this.stockEmisor);
    }
    this.emisorInicio = (this.stockEmisor.existencia - this.stockEmisor.comprometido);
    let stockReceptor: Stock = await this.getStock(this.cargadorDepositoReceptor.codDeposito, this.stockEmisor.producto.codProducto);
    if (stockReceptor) {
      this.receptorInicio = stockReceptor.existencia;
      this.receptorFin = (stockReceptor.existencia + this.cantidadTransferencia);
    } else {
      this.receptorInicio = 0;
      this.receptorFin = this.cantidadTransferencia;
    }
    detalle.producto = this.stockEmisor.producto;
    detalle.unidadMedida = this.stockEmisor.unidadMedida;
    detalle.nroItem = this.transferencia.detalle.length + 1;
    detalle.cantidadTransferencia = this.cantidadTransferencia;
    detalle.emisorInicio = this.stockEmisor.existencia;
    detalle.emisorFin = (this.stockEmisor.existencia - this.cantidadTransferencia);
    detalle.receptorInicio = this.receptorInicio;
    detalle.receptorFin = this.receptorFin;
    this.transferencia.detalle.push(detalle); /// insertar
    this.emisorInicio = 0;
    this.emisorFin = 0;
    this.receptorInicio = 0;
    this.receptorFin = 0;
    this.cantidadTransferencia = 0;
    this.stockEmisor = null;
    this.stocksEmisor = await this.getStockDisponible(this.cargadorDepositoEmisor.codDeposito);
  }


  async limpiar() {
    let codDeposito = (!this.cargadorDepositoEmisor) ? 0 : this.cargadorDepositoEmisor.codDeposito;
    let reestock = await this.cancelarStockComprometido(codDeposito, this.transferencia.detalle);
    console.log('listooo');
    this.ngOnInit();
  }



  async cancelarStockComprometido(codDeposito: number, detalles: TransferenciaDetalle[]) {
    let detall = this._stockServices.cancelarComprometidoTransferencia(codDeposito, detalles).toPromise();
    return detall;
  }



  async quitarDetalle(index) {
    let stock: Stock = await this.getStock(this.cargadorDepositoEmisor.codDeposito, this.transferencia.detalle[index].producto.codProducto);
    stock.comprometido = (stock.comprometido - this.transferencia.detalle[index].cantidadTransferencia);
    this.setStock(stock);
    this.transferencia.detalle.splice(index, 1);
  }

  async next() {
    if (!this.cargadorDepositoEmisor) {
      this.invalido('Emisor no puede ser null');
      return;
    }
    if (!this.cargadorDepositoReceptor) {
      this.invalido('Receptor no puede ser null');
      return;
    }
    if (!this.cargadorMotivoTransferencia) {
      this.invalido('Motivo no puede ser null');
      return;
    }
    if (this.cargadorDepositoEmisor.codDeposito == this.cargadorDepositoReceptor.codDeposito) {
      this.cargadorDepositoEmisor = null;
      this.cargadorDepositoReceptor = null;
      this.invalido('Depositos emisor y receptor no pueden ser iguales');
      return;
    }
    this.stocksEmisor = await this.getStockDisponible(this.cargadorDepositoEmisor.codDeposito);
    if (!this.stocksEmisor) {
      this.cargadorDepositoEmisor = null;
      this.invalido('Deposito emisor no tiene materiales con stock para realizar la transferencia');
      return;
    }
    this.disabledEmisor = true;
    this.disabledReceptor = true;
    this.disabledMotivo = true;
    this.mostrarDetalle = true;


  }

  validarValor(valor) {
    console.log(valor);
    if (valor > this.emisorInicio) {
      this.invalido('el valor de transferencia no puede ser mayor al stock del deposito emisor');
      this.cantidadTransferencia = 0;
      return;
    }
  }

  async seleccionarProducto(item: Stock) {
    console.log(item);
    if (item) {
      this.stockEmisor = item;
      this.emisorInicio = this.stockEmisor.existencia - this.stockEmisor.comprometido;
    }
    this.stocksEmisor = await this.getStockDisponible(this.cargadorDepositoEmisor.codDeposito);
  }
  seleccionarDepositoEmisor(item: Deposito) {
    console.log(item);
    this.cargadorDepositoEmisor = item;
  }
  seleccionarDepositoReceptor(item: Deposito) {
    console.log(item);
    this.cargadorDepositoReceptor = item;
  }
  seleccionarMotivo(item: MotivoTransferencia) {
    console.log(item);
    this.cargadorMotivoTransferencia = item;
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 2200 });
    Swal.fire('Atención', invalido, 'warning');
  }

  notificacion(mensaje: string) {
    this.toastr.success(mensaje, 'Exito!!!', {
      timeOut: 1500,
    });
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
  async getStockDisponible(codDeposito: number) {
    let stocks = this._stockServices.getStockDisponible(this._loginServices.user.codEmpresa, codDeposito).toPromise();
    return stocks;
  }
  async getStock(codDeposito: number, codProducto: number) {
    let stock = this._stockServices.traerStock(codDeposito, codProducto).toPromise();
    return stock;
  }

  setStock(stock) {
    this._stockServices.update(stock).subscribe((res) => console.log('*********stock comprometido alterado'));
  }
  async clean() {
    this.stockEmisor = null;
    this.stocksEmisor = await this.getStockDisponible(this.cargadorDepositoEmisor.codDeposito);
  }


  /*  async create(p: Proveedor) {
     let proveedor = this._proveedorServices.create(p).toPromise();
     return proveedor;
   } */
}
