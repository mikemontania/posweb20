import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Descuento } from '../../models/descuento.model';
import { TransferenciaService, LoginService } from '../../services/service.index';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user.model';
import { Transferencia } from '../../models/transferencia.model';
import { TransferenciaDetalle } from '../../models/transferenciaDetalle.model';

@Component({
  selector: 'app-transferencia-lista-detalles',
  templateUrl: './transferenciaListaDetalles.component.html',
  styles: []
})
export class TransferenciaListaDetallesComponent implements OnInit {
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
  transferencia: Transferencia;
  detalles: TransferenciaDetalle[] = [];
  descuentos: Descuento[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  rutaPaginador: string = '/transferenciasLista/page';

  constructor(private _transferenciaService: TransferenciaService,
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    public router: Router,
    private toastr: ToastrService,
    public http: HttpClient,
    public _loginServices: LoginService,
  ) { }

  ngOnInit() {
    this.limpiar();
    this.user = this._loginServices.user;
    this.descuento = false;
    console.log('listas');
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._transferenciaService.traerbyId(id)
          .subscribe((response: any) => {
            if (response) {
              console.log('modelo', response);
              this.transferencia = response;
              this.detalles = this.transferencia.detalle;
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
    this.transferencia = null;
    this.detalles = [];
    this.descuentos = [];
    this.paginador = null;
    this.paginas = [];
    this.sinImagen = './assets/images/sin-imagen.jpg';
    this.busqueda = '';
    this.totalElementos = 0;
    this.rutaPaginador = '/transferenciasLista/page';
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
