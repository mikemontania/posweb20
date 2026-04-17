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
import { CompraService, LoginService, MotivoAnulacionCompraService,   UsuarioService } from '../../services/service.index';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { StockService } from '../../services/stock/stock.service';
import { Proveedor } from '../../models/proveedor.model';
import { Compra } from '../../models/compra.model';

// guardarhistorial
interface ComprasStorage {
  fechaInicio: string;
  fechaFin: string;
  cargadorProveedor: Proveedor;
  cargadorUsuario: Usuarios;
  nroComprobante: string;
  estado: string;
  size: number;
  page: number;
}

@Component({
  selector: 'app-list-compras',
  templateUrl: './comprasLista.component.html',
  styles: [``]
})
export class ComprasListaComponent implements OnInit {
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  estados: any[] = [
    { id: 'TEMP', descripcion: 'TEMP' },
    { id: 'SYNC', descripcion: 'SYNC' },
    { id: 'WARNING', descripcion: 'WARNING' },
    { id: 'CANCEL', descripcion: 'CANCEL' },
    { id: 'ERROR', descripcion: 'ERROR' }];

  user: User;
  tipo: string = ' Cliente - Comprador';
  compraStorage: ComprasStorage = null; // guardarhistorial
  tamanhoPag: string = 'md';
  modalAnulacion: string = 'oculto';
  cargadorUsuario: Usuarios;
  cargadorProveedor: Proveedor;
  seleccionMotivo: number;
  size: number;
  codUsuario: number;
  codCompra: number;
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
  compraAnulacion: Compra;
  detalles: VentaDetalle[] = [];
  sucursales: Sucursal[] = [];
  usuarios: Usuarios[] = [];
  cobranzaDetalles: CobranzaDetalle[] = [];
  motivosAnulacion: MotivoAnulacion[] = [];
  mAnulacion: MotivoAnulacion;
  compras: Compra[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/comprasLista/page';
  rutaDetalles: string = '/comprasLista/id';
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

  constructor(private _compraService: CompraService,
    public _loginServices: LoginService,
    public _stockServices: StockService,
    private _AnulacionService: MotivoAnulacionCompraService,
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
    this.cargadorProveedor = null;
    this.cargadorUsuario = null;
    // this.cargadorSucursal = null;
    this.nroComprobante = '';
    this.estado = null;
    this.codCompra = 0;
    this.rol = this._loginServices.user.authorities[0];
    console.log('rol,', this.rol);
    this.user = this._loginServices.user;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;
    if (localStorage.getItem('compraStorage')) { // guardarhistorial
      this.compraStorage = JSON.parse(localStorage.getItem('compraStorage'));
      this.pagina = +localStorage.getItem('page');
      this.fechaInicio = this.compraStorage.fechaInicio,
        this.fechafin = this.compraStorage.fechaFin,
        this.cargadorProveedor = this.compraStorage.cargadorProveedor,
        this.cargadorUsuario = this.compraStorage.cargadorUsuario,
        this.nroComprobante = this.compraStorage.nroComprobante,
        this.estado = this.compraStorage.estado,
        this.size = this.compraStorage.size;
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
    this._compraService.findByFecha(
      page,
      this.fechaInicio,
      this.fechafin,
      this.cargadorProveedor,
      this.cargadorUsuario,
      this.nroComprobante,
      this.estado,
      this.size
    )
      .subscribe(async (r: any) => {
        console.log(r);
        this.compras = r.content as Compra[];
        this.paginador = r;
        this.totalElementos = r.totalElements;
        this.cantidadElementos = r.size;
        localStorage.removeItem('compraStorage'); // guardarhistorial
        localStorage.removeItem('page'); // guardarhistorial
        if (this.paginador.empty === true) {
          this.sinResultado = true;
          this.compras = [];
          this.cargando = false;
        } else {
          this.cargando = false;

        }
      });
  }

  verTodos() {
    this.cargadorProveedor = null;
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
  

  cambioNumero(EVENTO) {
    this.size = EVENTO;
  }

  seleccionarUsuario(item: Usuarios) {
    this.usuario = item;
    this.cargadorUsuario = item;
  }

  seleccionarProveedor(item: Proveedor) {
    this.cargadorProveedor = item;
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
    let anular = await this.anular(this.codCompra, this.mAnulacion);
    console.log(anular);
    this.codCompra = 0;
    this.modalAnulacion = 'oculto';
    swal.fire('Compra anulada ', 'Compra anulada con exito', 'success');
    this.get(0);
    this.seleccionMotivo = 0;

  }

  async traerPorID(cod) {
    let c = this._compraService.traerPorID(cod).toPromise();
    return c;
  }


  async anular(codigo, mAnulacion) {
    let res = this._compraService.anularCompra(codigo, mAnulacion)
      .toPromise();
    return res;

  }

  async traerMotrivosAnul() {
    let res = this._AnulacionService.traerByCodEmp(this.user.codEmpresa)
      .toPromise();
    return res;
  }
  async mostrarModalAnulacion(cod) {
    this.codCompra = cod;
    let respo = await this.traerPorID(cod);
    this.compraAnulacion = respo.compra;
    this.motivosAnulacion = await this.traerMotrivosAnul();
    this.mAnulacion = this.motivosAnulacion[0];
    this.modalAnulacion = '';
    console.log(this.motivosAnulacion);
  }
  cerrarModalAnulacion() {
    this.compraAnulacion = null;
    this.modalAnulacion = 'oculto';
    this.seleccionMotivo = 0;
    this.mAnulacion = null;
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
    this.compraStorage = {
      page: 0,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechafin,
      cargadorProveedor: this.cargadorProveedor,
      cargadorUsuario: this.cargadorUsuario,
      nroComprobante: this.nroComprobante,
      estado: this.estado,
      size: this.size
    };
    localStorage.setItem('compraStorage', JSON.stringify(this.compraStorage));
    this.router.navigate([this.rutaDetalles, param]);
  }



  async traerModeloPorId(cod) {
    let response = this._compraService.traerPorID(cod).toPromise();
    return response;
  }




}
