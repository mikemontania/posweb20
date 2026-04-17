import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cobranza } from '../../models/cobranza.model';
import { Descuento } from '../../models/descuento.model';
import { CompraService, DescuentoService, LoginService } from '../../services/service.index';
import { Location } from '@angular/common';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';
import { BancosService } from '../../services/bancos/bancos.service';
import { TipoMedioPagoService } from '../../services/tipoMedioPago/tipoMedioPago.service';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { MedioPago } from '../../models/medioPago.model';
import { Bancos } from '../../models/bancos.model';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user.model';
import { Compra } from '../../models/compra.model';
import { CompraDetalle } from '../../models/compraDetalle.model';

@Component({
  selector: 'app-compra-lista-detalles',
  templateUrl: './compraListaDetalles.component.html',
  styles: []
})
export class CompraListaDetallesComponent implements OnInit {
 
  token: string;
  nroRef: string;
  nroCuenta: string;
  oculto: string = 'oculto';
  codCobranzaDetalle: number = 0;
  /************************************************** */
  user: User;
  cargando2: boolean = true;
  cargando: boolean = false;
  descuento: boolean = false;
  formaContadoFalse: boolean;
  compra: Compra;
  detalles: CompraDetalle[] = [];
  descuentos: Descuento[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/comprasLista/page';

  constructor(private _compraService: CompraService,
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
        this._compraService.traerPorID(id)
          .subscribe((response: any) => {
            if (response) {
              console.log('modelo', response);
              this.compra = response;            
                this.detalles = this.compra.detalle;
                this.detalles.sort(function (a, b) {
                  return a.nroItem - b.nroItem;
                });
              }
          });
      }

    });
  }
 
  atras() {
    this._location.back();
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 1500 });
    Swal.fire('Atención', invalido, 'warning');
  }
   

 


  limpiar() {
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
    this.compra = null;
     this.detalles = [];
    this.descuentos = [];
    this.paginador = null;
    this.paginas = [];
    this.sinImagen = './assets/images/sin-imagen.jpg';
    this.busqueda = '';
    this.totalElementos = 0;
    this.rutaPaginador = '/comprasLista/page';
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
