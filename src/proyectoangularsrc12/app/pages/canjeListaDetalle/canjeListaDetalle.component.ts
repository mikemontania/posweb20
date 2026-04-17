import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Descuento } from '../../models/descuento.model';
import { DescuentoService, LoginService, MedioPagoService, BancosService, TipoMedioPagoService, ExcelService, CanjesService } from '../../services/service.index';
import { Location } from '@angular/common';
import { Canje } from '../../models/canje.model';
import { CanjeDet } from '../../models/CanjeDet.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { MedioPago } from '../../models/medioPago.model';
import { Bancos } from '../../models/bancos.model';
import { Cobranza } from '../../models/cobranza.model';
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-det-canje',
  templateUrl: './canjeListaDetalle.component.html',
  styles: []
})
export class CanjeListaDetallesComponent implements OnInit {
  cargando2: boolean = true;
  cargando: boolean = false;
  descuento: boolean = false;
  formaContadoFalse: boolean;
  canje: Canje;
  canjes: Canje[] = [];
  detalles: CanjeDet[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/canjeLista/page';
  seleccionMedioPago: number;
  fechaInicio: string;
  fechaFin: string;
  fechaEmision: string;
  fechaVencimiento: string;
  token: string;
  nroRef: string;
  nroCuenta: string;
  oculto: string = 'oculto';
  
  user: User;
  cobranza: Cobranza;
  cobranzaDetalles: CobranzaDetalle[] = [];

  constructor(private _canjeService: CanjesService,
    private activatedRoute: ActivatedRoute,
    public _excelService: ExcelService,
    private _location: Location,
    public router: Router,
    private toastr: ToastrService,
    public http: HttpClient,
    public _loginServices: LoginService,
  ) { }

  ngOnInit() {
    this.descuento = false;
    console.log('listas');
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._canjeService.getById(id)
          .subscribe((response: any) => {
            if (response.canje) {
              console.log('res', response);
              this.canje = response.canje;
              this.canjes.push(response.canje);
              this.detalles = this.canje.detalle;
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
  
  export(array: any[]): void {
    console.log(array);
    if (array.length > 0) {
      this._excelService.exportAsExcelFile(array, 'xlsx');
    } else {
      this.invalido('No se puede exportar datos de la nada!!!');
    }

  }
  
 

 
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
