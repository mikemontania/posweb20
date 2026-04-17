import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Descuento } from '../../models/descuento.model';
import { DescuentoService, LoginService, MedioPagoService, BancosService, TipoMedioPagoService, ExcelService } from '../../services/service.index';
import { Location } from '@angular/common';
import { Pedido } from '../../models/pedido.model';
import { PedidoDetalle } from '../../models/PedidoDetalle.model';
import { PedidosService } from '../../services/pedidos/pedidos.service';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { MedioPago } from '../../models/medioPago.model';
import { Bancos } from '../../models/bancos.model';
import { Cobranza } from '../../models/cobranza.model';
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Cliente } from 'src/app/models/cliente.model';

@Component({
  selector: 'app-det-ped',
  templateUrl: './pedidoListaDetalles.component.html',
  styles: [`
  agm-map {
    height: 500px;
  }
  `]
})
export class PedidoListaDetallesComponent implements OnInit {
  cargando2: boolean = true;
  cargando: boolean = false;
  descuento: boolean = false;
  formaContadoFalse: boolean;
  pedido: Pedido;
  cliente: Cliente;
  pedidos: Pedido[] = [];
  detalles: PedidoDetalle[] = [];
  descuentos: Descuento[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/pedidoLista/page';
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
  modalOrden: string = 'oculto';
  modalCliente: string = 'oculto';
  codCobranzaDetalle: number = 0;
  user: User;
  cobranza: Cobranza;
  cobranzaDetalles: CobranzaDetalle[] = [];
  pagado: boolean = false;
  copiado: boolean = false;
  /***************MAP************************ */
  lat = 0
  lng = 0;
  zoomMap: number = 14;
  previous: any;
  linkBase = 'http://www.google.com/maps/place/';

  /************************************************** */
  constructor(private _pedidoService: PedidosService,
    private activatedRoute: ActivatedRoute,
    public _excelService: ExcelService,
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
    this.descuento = false;
    console.log('listas');
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._pedidoService.getById(id)
          .subscribe((response: any) => {
            if (response.pedido) {
              console.log('res', response);
              this.pedido = response.pedido;
              this.cliente = response.pedido.cliente;
              this.pedidos.push(response.pedido);
              this.detalles = this.pedido.detalle;
              this.detalles.sort(function (a, b) {
                return a.nroItem - b.nroItem;
              });
              if (response.pedido.cobranza) {
                this.cobranza = response.pedido.cobranza;
                this.cobranzaDetalles = this.cobranza.detalle;
                this.cobranzaDetalles.sort(function (a, b) {
                  return a.codCobranzaDetalle - b.codCobranzaDetalle;
                });
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
            //Llamamos a la funcion verificarPagado
            this.pagado = this.verificarPagado(this.cobranzaDetalles);
          });
      }
    });
  }

  verificarPagado(detalleCobranza: CobranzaDetalle[]) {
    return detalleCobranza.some(detalle => detalle?.nroRef?.length > 0 )
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
      'tipo': 'PEDIDO'
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
  cancelarModalOrden() {
    this.modalOrden = 'oculto';
  }
  mostrarModalOrden() {
    this.modalOrden = '';
  }

  cancelarModalCliente() {
    this.modalCliente = 'oculto';
  }

  mostrarModalCliente() {
    this.modalCliente = '';
  }

  mostrarModalDelivery() {
    this.copiarDatosDelivery();
  }

  copiarDatosDelivery() {
    //Contruir el texto con los datos del modal
    const datos = `Razón Social: ${this.cliente?.razonSocial || 'N/A'}
Nro Documento: ${this.cliente?.docNro || 'N/A'}
Dirección: ${this.cliente?.direccion || 'N/A'}
Teléfono: ${this.cliente?.telefono || 'N/A'}
Ubicación: ${this.pedido?.observacion || 'N/A'}`;
      // Copiar al portapapeles
      navigator.clipboard.writeText(datos).then(() => {
        console.log('Datos copiados al portapapeles');
        this.copiado = true;
        //Desactivar el check despues de 2 segundos
        setTimeout(() => {
          this.copiado = false;
        }, 2000);
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
  }

  export(array: any[]): void {
    console.log(array);
    if (array.length > 0) {
      this._excelService.exportAsExcelFile(array, 'xlsx');
    } else {
      this.invalido('No se puede exportar datos de la nada!!!');
    }

  }
  mostrarModal() {
    console.log(this.pedido);
    if (!this.pedido) {
      this.invalido('Pedido no puede ser nulo');
      return;
    }
    if (this.pedido) {
      if (this.pedido.importeTotal <= 0) {
        this.invalido('Pedido debe ser mayor a 0');
        return;
      }
    }
    this.medioPago.splice(0, this.medioPago.length);
    this.selectModelMedio = null;
    this._bancosServices.traerByCodEmp(this._loginServices.user.codEmpresa).subscribe(bancos => {
      this.bancos = bancos;
      this._medioPagoServices.traerMedioPago(this._loginServices.user.codEmpresa).subscribe(medioPago => {
        this.medioPago = medioPago;
        this._tipoMedioPagoServices.traerByCodEmp(this._loginServices.user.codEmpresa).subscribe(tipoMedioPago => {
          this.oculto = '';
          this.tipoMedioPago = tipoMedioPago;
          this.totalAbonado = 0;
          this.selectModelMedio = null;
          this.seleccionMedioPago = null;
          this.iniciarCobranza();
          this.cambioMedioPago(this.pedido.cliente.medioPagoPref.codMedioPago);
          this.cobranza.importeCobrado = Math.round(this.pedido.importeTotal);
          this.oculto = '';
        });
      });
    });

  }

  guardarCobranza() {
    let montoCobrandoCab = this.pedido.importeTotal;
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
      this.invalido('EL total de cobranza no puede ser menor al pedido');
      return;
    }

    /*********      cargar cobranzas       ****** */
    this.cobranza.importeAbonado = this.totalAbonado;
    this.cobranza.saldo = (this.cobranza.importeCobrado - this.totalAbonado);
    this.cobranza.detalle = null;
    this.cobranza.detalle = this.cobranzasDetalle;
    /*********      cargar ventas         ****** */
    this.pedido.cobranza = this.cobranza;
    let modelo = {
      'pedido': this.pedido,
      'descuentos': this.descuentos
    };
    console.log('enviado ..', modelo);
    this._pedidoService.cambiarCobranza(modelo).subscribe((resp: any) => {
      this.oculto = 'oculto';
      let pedido = resp.pedido as Pedido;
      this.ngOnInit();
    });
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
      if (this.cobranzasDetalle[indice].medioPago.codMedioPago === detalleCobranza.medioPago.codMedioPago) {
        console.log('existe.. entonces se aumenta');
        this.cobranzasDetalle[indice].importeAbonado = (this.cobranzasDetalle[indice].importeAbonado + detalleCobranza.importeAbonado);
        this.cobranzasDetalle[indice].importeCobrado = (this.cobranzasDetalle[indice].importeCobrado + detalleCobranza.importeCobrado);
        this.cobranzasDetalle[indice].saldo = (this.cobranzasDetalle[indice].saldo + detalleCobranza.saldo);
        this.totalAbonado += detalleCobranza.importeAbonado;
        this.cobranza.importeCobrado = Math.round(this.pedido.importeTotal);
        this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
        this.montoAbonado = 0;
        this.selectModelMedio = null;
        this.cambioMedioPago(this.pedido.cliente.medioPagoPref.codMedioPago);
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
      this.vuelto = (this.totalAbonado - this.cobranza.importeCobrado);
      this.montoAbonado = 0;
      this.cambioMedioPago(this.pedido.cliente.medioPagoPref.codMedioPago);
      this.selectModelTipoMedioPago = null;
      this.selectModelBanco = null;
      this.fechaEmision = null;
      this.fechaVencimiento = null;
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
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
