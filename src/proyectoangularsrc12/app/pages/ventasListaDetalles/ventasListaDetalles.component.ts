import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { VentasService } from '../../services/ventas/ventas.service';
import { Venta } from '../../models/venta.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cobranza } from '../../models/cobranza.model';
import { Descuento } from '../../models/descuento.model';
import { DescuentoService, LoginService } from '../../services/service.index';
import { FormaVenta } from '../../models/formaVenta.model';
import { Location } from '@angular/common';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';
import { BancosService } from '../../services/bancos/bancos.service';
import { TipoMedioPagoService } from '../../services/tipoMedioPago/tipoMedioPago.service';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { MedioPago } from '../../models/medioPago.model';
import { Bancos } from '../../models/bancos.model';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-det',
  templateUrl: './ventasListaDetalles.component.html',
  styles: [`
  agm-map {
    height: 500px;
  }
  `]
})
export class VentasListaDetallesComponent implements OnInit {
  seleccionMedioPago: number;
  totalSaldo: number = 0;
  totalAbonado: number = 0;
  montoAbonado: number = 0;
  vuelto: number = 0;
  cobranzasDetalle: CobranzaDetalle[] = [];
  tipoMedioPago: TipoMedioPago[] = [];
  medioPago: MedioPago[] = [];
  bancos: Bancos[] = [];
  editCobranza: Cobranza;
  selectModelMedio: MedioPago;
  selectModelBanco: Bancos;
  selectModelTipoMedioPago: TipoMedioPago;
  fechaInicio: string;
  fechaFin: string;
  fechaEmision: string;
  fechaVencimiento: string;
  token: string;
  nroRef: string;
  nroCuenta: string;
  oculto: string = 'oculto';
  codCobranzaDetalle: number = 0;

  /***************MAP************************ */
  lat = 0
  lng = 0;
  zoomMap: number = 14;
  previous: any;
  linkBase = 'http://www.google.com/maps/place/';

  /************************************************** */
  user: User;
  cargando2: boolean = true;
  cargando: boolean = false;
  descuento: boolean = false;
  formaContadoFalse: boolean;
  venta: Venta;
  cliente: Cliente;
  cobranza: Cobranza;
  detalles: VentaDetalle[] = [];
  descuentos: Descuento[] = [];
  cobranzaDetalles: CobranzaDetalle[] = [];
  ventas: Venta[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/ventasLista/page';

  constructor(private _ventasService: VentasService,
    private activatedRoute: ActivatedRoute,
    private _descuentoService: DescuentoService,
    private _location: Location,
    public router: Router,
    private toastr: ToastrService,
    public http: HttpClient,
    public _loginServices: LoginService,
    public _medioPagoServices: MedioPagoService,
    public _bancosServices: BancosService,
    public _tipoMedioPagoServices: TipoMedioPagoService,
  ) { }

  ngOnInit() {
    this.limpiar();
    this.user = this._loginServices.user;
    this.descuento = false;
    console.log('listas');
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._ventasService.traerVentaPorID(id)
          .subscribe((response: any) => {
            if (response.venta) {
              console.log('modelo', response);
              this.venta = response.venta;
              this.cliente = response.venta.cliente;
              this.ventas.push(response.venta);
              if (this.venta.formaVenta.cantDias == 0 && this.venta.esObsequio == false) {
                this.cobranza = response.venta.cobranza;
                this.detalles = this.venta.detalle;
                this.detalles.sort(function (a, b) {
                  return a.nroItem - b.nroItem;
                });
                this.cobranzaDetalles = this.cobranza.detalle;
                this.cobranzaDetalles.sort(function (a, b) {
                  return a.codCobranzaDetalle - b.codCobranzaDetalle;
                });
                this.formaContadoFalse = false;
              } else {
                this.detalles = this.venta.detalle;
                this.formaContadoFalse = true;
              }
            }
            for (let i = 0; i < response.descuentos.length; i++) {
              if (response.descuentos) {
                this._descuentoService.getDescuentoById(response.descuentos[i].codDescuento).subscribe((descuento) => {
                  this.descuentos.push(descuento);
                });
              }
              if (i == response.descuentos.length - 1) {
                console.log(this.descuentos);
                this.descuento = true;
              }
            }
          });
      }

    });
  }


  clickedMarker(infowindow) {
    console.log(infowindow);
    if (this.previous) {
      this.previous.close();
    }
    this.previous = infowindow;
  }
  openLink() {
    let newLink = this.linkBase + this.cliente.latitud + ',' + this.cliente.longitud;
    window.open(newLink, '_blank');
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

  iniciarCobranza() {
    this.editCobranza = {
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
  atras() {
    this._location.back();
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 1500 });
    Swal.fire('Atención', invalido, 'warning');
  }
  cerrarModal() {
    this.oculto = 'oculto';
    this.medioPago.splice(0, this.medioPago.length);
    this.tipoMedioPago.splice(0, this.tipoMedioPago.length);
    this.bancos.splice(0, this.bancos.length);
    this.ngOnInit();
  }
  cancelarModal() {
    this.oculto = 'oculto';
    this.medioPago.splice(0, this.medioPago.length);
    this.tipoMedioPago.splice(0, this.tipoMedioPago.length);
    this.bancos.splice(0, this.bancos.length);
    this.ngOnInit();

  }


  mostrarModal() {
    console.log(this.venta);
    if (!this.venta) {
      this.invalido('Venta no puede ser nulo');
      return;
    }
    if (this.venta) {
      if (this.venta.importeTotal <= 0) {
        this.invalido('Venta debe ser mayor a 0');
        return;
      }
    }
    this.medioPago.splice(0, this.medioPago.length);
    this.selectModelMedio = null;
    this._bancosServices.traerByCodEmp(this.user.codEmpresa).subscribe(bancos => {
      this.bancos = bancos;
      this._medioPagoServices.traerMedioPago(this.user.codEmpresa).subscribe(medioPago => {
        this.medioPago = medioPago;
        this._tipoMedioPagoServices.traerByCodEmp(this.user.codEmpresa).subscribe(tipoMedioPago => {
          this.oculto = '';
          this.tipoMedioPago = tipoMedioPago;
          this.totalAbonado = 0;
          this.selectModelMedio = null;
          this.seleccionMedioPago = null;
          this.iniciarCobranza();
          this.cambioMedioPago(this.venta.cliente.medioPagoPref.codMedioPago);
          this.cobranza.importeCobrado = Math.round(this.venta.importeTotal);
          this.oculto = '';
        });
      });
    });

  }


  limpiar() {
    this.seleccionMedioPago = 0;
    this.totalSaldo = 0;
    this.totalAbonado = 0;
    this.montoAbonado = 0;
    this.vuelto = 0;
    this.cobranzasDetalle = [];
    this.tipoMedioPago = [];
    this.medioPago = [];
    this.bancos = [];
    this.editCobranza = null;
    this.selectModelMedio = null;
    this.selectModelBanco = null;
    this.selectModelTipoMedioPago = null;
    this.fechaInicio = null;
    this.fechaFin = null;
    this.fechaEmision = null;
    this.fechaVencimiento = null;
    this.token = null;
    this.nroRef = null;
    this.nroCuenta = null;
    this.oculto = 'oculto';
    this.codCobranzaDetalle = 0;



    this.user = null;
    this.cargando2 = true;
    this.cargando = false;
    this.descuento = false;
    this.formaContadoFalse = null;
    this.venta = null;
    this.cobranza = null;
    this.detalles = [];
    this.descuentos = [];
    this.cobranzaDetalles = [];
    this.ventas = [];
    this.paginador = null;
    this.paginas = [];
    this.sinImagen = './assets/images/sin-imagen.jpg';
    this.busqueda = '';
    this.totalElementos = 0;
    this.rutaPaginador = '/ventasLista/page';
  }

  guardarCobranza() {
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

    /*********      cargar cobranzas       ****** */
    this.cobranza.importeAbonado = this.totalAbonado;
    this.cobranza.saldo = (this.cobranza.importeCobrado - this.totalAbonado);
    this.cobranza.fechaCobranza =  this.venta.fechaVenta;
    this.cobranza.detalle = null;
    this.cobranza.detalle = this.cobranzasDetalle;
    /*********      cargar ventas         ****** */
    this.venta.cobranza = this.cobranza;
    let modelo = {
      'venta': this.venta,
      'descuentos': this.descuentos
    };
    console.log('enviado ..', modelo);
    this._ventasService.cambiarCobranza(modelo).subscribe((resp: any) => {
      let venta = resp.venta as Venta;

      this.ngOnInit();
    });
  }
  agregarCobranza() {
    if (this.montoAbonado < 100) { //  SI MONTO ES MENOR A 100
      this.invalido('Monto de cobranza no puede ser menor a 100 Gs.');
      return;
    }
    if (!this.selectModelMedio) { // SI NO SE SELECCIONA MEDIO PAGO
      this.invalido('Medio pago no puede ser nulo');
      return;
    }
    if (this.selectModelMedio) { // SI SE SELECCIONA MEDIO PAGO Y NO SE COMPLETA LOS DATOS REQUERIDOS
      if (this.selectModelMedio.tieneBanco && !this.selectModelBanco) {       // TIENE BANCO
        this.invalido('Banco no puede ser nulo');
        return;
      }
      if (this.selectModelMedio.tieneTipo && !this.selectModelTipoMedioPago) { // TIENE TIPO
        this.invalido('Tipo no puede ser nulo');
        return;
      }
      if (this.selectModelMedio.tieneRef && !this.nroRef) {                    // TIENE REF
        this.invalido('Numero de referencia no puede ser nulo no puede ser nulo');
        return;
      }
      if (this.selectModelMedio.esCheque) {                                    // SI ES CHEQUE
        if (!this.fechaEmision) {
          this.invalido('Fecha de emision no puede ser nulo');
          return;
        }
        if (!this.fechaVencimiento) {
          this.invalido('Fecha de vencimiento no puede ser nulo no puede ser nulo');
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
      if (this.nroRef.length < 10) {
        this.nroRef = this.nroRef.padStart(10, '0');
        console.log('Nro referencia completada con ceros:', this.nroRef);
      }
    }
    this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
    if (this.codCobranzaDetalle === 0) {
      this.codCobranzaDetalle = 1;
    }
    console.log('agregar cobranza');
    let detalleCobranza: CobranzaDetalle;
    /*   this.totalSaldo = Math.round(this.totalSaldo - this.montoAbonado);
      let importeCobrado: number;
      if (this.totalSaldo < 0) {
         importeCobrado =   Math.round(this.montoAbonado - (this.totalSaldo * -1));
      } else {
         importeCobrado = this.montoAbonado;
      } */
    detalleCobranza = {
      'codCobranzaDetalle': this.codCobranzaDetalle,
      'importeAbonado': this.montoAbonado,
      'importeCobrado': 0,
      'saldo': 0,
      'medioPago': this.selectModelMedio,
      'tipoMedioPago': this.selectModelTipoMedioPago,
      'fechaEmision': this.fechaEmision,
      'fechaVencimiento': this.fechaVencimiento,
      'nroRef': this.nroRef,
      'banco': this.selectModelBanco,
      'nroCuenta': this.nroCuenta
    };
    this.codCobranzaDetalle = this.codCobranzaDetalle + 1;
    let bandera: boolean = true;

    for (let indice = 0; indice < this.cobranzasDetalle.length; indice++) {
      console.log('agregar cobranza');
      console.log(this.cobranzasDetalle[indice]);
      //Si es tarjeta (cod = 2) no se combina, sigue al siguiente
      if(detalleCobranza.medioPago.codMedioPagoErp === '2') {
        bandera = true;
        continue;
      }
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
        this.cambioMedioPago(this.venta.cliente.medioPagoPref.codMedioPago);
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
      this.cambioMedioPago(this.venta.cliente.medioPagoPref.codMedioPago);
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

  usar(monto) {
    this.montoAbonado = monto;
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
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
