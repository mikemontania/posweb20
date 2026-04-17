import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
 import { VentaDetalle } from '../../models/VentaDetalle.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
 import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
 import { User } from '../../models/user.model';
import { TransferenciaService, LoginService,     UsuarioService } from '../../services/service.index';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { StockService } from '../../services/stock/stock.service';
 import { Transferencia } from '../../models/transferencia.model';

// guardarhistorial
interface TransferenciasStorage {
  fechaInicio: string;
  fechaFin: string;
  cargadorUsuario: Usuarios;
  nroComprobante: string;
  estado: string;
  size: number;
  page: number;
}

@Component({
  selector: 'app-list-transferencia-ista',
  templateUrl: './transferenciaLista.component.html',
  styles: [``]
})
export class TransferenciaListaComponent implements OnInit {
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  estados: any[] = [
    { id: 'TEMP', descripcion: 'TEMP' },
    { id: 'SYNC', descripcion: 'SYNC' },
    { id: 'WARNING', descripcion: 'WARNING' },
    { id: 'CANCEL', descripcion: 'CANCEL' },
    { id: 'ERROR', descripcion: 'ERROR' }];

  user: User;
  tipo: string = ' Cliente - Transferenciador';
  transferenciaStorage: TransferenciasStorage = null; // guardarhistorial
  tamanhoPag: string = 'md';
  modalAnulacion: string = 'oculto';
  cargadorUsuario: Usuarios;
   seleccionMotivo: number;
  size: number;
  codUsuario: number;
  codTransferencia: number;
  fechaInicio: string;
  nroComprobante: string;
  estado: string;
  fechafin: string;
  usuario: Usuarios;
  sucursal: Sucursal;
  sinResultado: boolean = false;
  cargando: boolean = false;
  oculto1: string = 'oculto';
  oculto2: string = 'oculto';
  transferenciaAnulacion: Transferencia;
  detalles: VentaDetalle[] = [];
  sucursales: Sucursal[] = [];
  usuarios: Usuarios[] = [];
  cobranzaDetalles: CobranzaDetalle[] = [];
  motivosAnulacion: MotivoAnulacion[] = [];
  mAnulacion: MotivoAnulacion;
  transferencias: Transferencia[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/transferenciaLista/page';
  rutaDetalles: string = '/transferenciaLista/id';
  codSucursal: number;
  seleccionUsuario: number;
  seleccionSucursal: number;
  rol: string;
  page: number = 0;

  public numeros: ObjetoSelector[] = [
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 15, descripcion: '15', enum: '15' },
    { cod: 20, descripcion: '20', enum: '20' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 40, descripcion: '40', enum: '40' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 100, descripcion: '100', enum: '100' }
  ];

  constructor(private _transferenciaService: TransferenciaService,
    public _loginServices: LoginService,
    public _stockServices: StockService,
     private _usuariosServices: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }

  async ngOnInit() {
    /*****variables */
    this.codSucursal = this._loginServices.user.codSucursal;
    this.cargando = true;
    this.size = 20;
     this.cargadorUsuario = null;
    // this.cargadorSucursal = null;
    this.nroComprobante = '';
    this.estado = null;
    this.codTransferencia = 0;
    this.rol = this._loginServices.user.authorities[0];
    console.log('rol,', this.rol);
    this.user = this._loginServices.user;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;
     
    /******************storage */
    if (localStorage.getItem('transferenciaStorage')) { // guardarhistorial
      this.transferenciaStorage = JSON.parse(localStorage.getItem('transferenciaStorage'));
      this.pagina = +localStorage.getItem('page');
      this.fechaInicio = this.transferenciaStorage.fechaInicio,
        this.fechafin = this.transferenciaStorage.fechaFin,
         this.cargadorUsuario = this.transferenciaStorage.cargadorUsuario,
        this.nroComprobante = this.transferenciaStorage.nroComprobante,
        this.estado = this.transferenciaStorage.estado,
        this.size = this.transferenciaStorage.size;
      this.page = this.pagina - 1;
      this.router.navigate([this.rutaPaginador, this.page]);
      this.loadPage(this.pagina);
    } else {
      this.router.navigate([this.rutaPaginador, this.page]);
      this.get(this.page);
    }

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, this.page]);
    this.activatedRoute.paramMap.subscribe(params => {
      this.page = +params.get('page');
      if (!this.page) {
        this.page = 0;
        this.router.navigate([this.rutaPaginador, this.page]);
      }
      this.get(this.page);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }
  buscar() {
    this.pagina = 1;
    this.loadPage(1);
    this.page = 0;
    this.router.navigate([this.rutaPaginador, 0]);
    /*    debounceTime(300);
       distinctUntilChanged(); */
    this.cargando = true;
    this.get(0);
  }

  get(page) {
    console.log(page);
    this._transferenciaService.findByFecha(
      page,
      this.fechaInicio,
      this.fechafin,
       this.cargadorUsuario,
      this.nroComprobante,
      this.estado,
      this.size
    )
      .subscribe(async (r: any) => {
        console.log(r);
        this.transferencias = r.content as Transferencia[];
        this.paginador = r;
        this.totalElementos = r.totalElements;
        this.cantidadElementos = r.size;
        localStorage.removeItem('transferenciaStorage'); // guardarhistorial
        localStorage.removeItem('page'); // guardarhistorial
        if (this.paginador.empty === true) {
          this.sinResultado = true;
          this.transferencias = [];
          this.cargando = false;
        } else {
          this.cargando = false;

        }
      });
  }

  verTodos() {
     this.cargadorUsuario = null;
    this.estado = null;
    this.fechaInicio = moment('2019-01-01').format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.get(0);
  }

  clean() {
    this.estado = '';
    this.buscar();
  }
  cambioEstado(estado) {
    if (estado) {
      this.estado = estado.id;
    } else {
      this.estado = '';
    }
    this.buscar();
  }
  mostrarModalVentas(id) {
    this._transferenciaService.traerbyId(id)
      .subscribe((vent: any) => {
        console.log(vent.venta);
        console.log(id);
        if (vent.venta) {
          console.log('abrir modal');
          this.detalles = vent.venta.detalle;
        }
      });
  }

 

  cambioNumero(EVENTO) {
    this.size = EVENTO;
  }

  seleccionarUsuario(item: Usuarios) {
    this.usuario = item;
    this.cargadorUsuario = item;
  }
 
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }



  async enviarAnulacion() {
    if (!this.mAnulacion) {
      this.invalido('Debe seleccionar motivo de anulación');
      return;
    }
    let anular = await this.anular(this.codTransferencia, this.mAnulacion);
    console.log(anular);
    this.codTransferencia = 0;
    this.modalAnulacion = 'oculto';
    swal.fire('Transferencia anulada ', 'Transferencia anulada con exito', 'success');
    this.get(0);
    this.seleccionMotivo = 0;

  }

  async traerPorID(cod) {
    let c = this._transferenciaService.traerbyId(cod).toPromise();
    return c;
  }


  async anular(codigo, mAnulacion) {
    let res = this._transferenciaService.anularTransferencia(codigo, mAnulacion)
      .toPromise();
    return res;

  }
 

  cambioTerminal(event) {
    for (let indice = 0; indice < this.motivosAnulacion.length; indice++) {           // tslint:disable-next-line:triple-equals
      if (this.motivosAnulacion[indice].codMotivoAnulacion == this.seleccionMotivo) {
        this.mAnulacion = this.motivosAnulacion[indice];
      }
    }
  }


  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }



  cambioUsuario(id) {
    this._usuariosServices.getUsuario(id).subscribe(cargadorUsuario => {
      this.cargadorUsuario = cargadorUsuario;
    });
  }

  editar(param) {// guardarhistorial
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
      }
      localStorage.setItem('page', JSON.stringify(page + 1));
      console.log('page', page);
    });
    this.transferenciaStorage = {
      page: 0,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechafin,
       cargadorUsuario: this.cargadorUsuario,
      nroComprobante: this.nroComprobante,
      estado: this.estado,
      size: this.size
    };
    localStorage.setItem('transferenciaStorage', JSON.stringify(this.transferenciaStorage));
    this.router.navigate([this.rutaDetalles, param]);
  }



  async traerModeloPorId(cod) {
    let response = this._transferenciaService.traerbyId(cod).toPromise();
    return response;
  }




}
