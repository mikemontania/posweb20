import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cliente } from '../../models/cliente.model';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { MotivoAnulacionService } from '../../services/motivoAnulacion/motivoAnulacion.service';
import { User } from '../../models/user.model';
import { LoginService, SucursalesService, UsuarioService, CanjesService, ExcelService } from '../../services/service.index';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Canje } from '../../models/canje.model'; 
import { TotalModel } from '../../models/totalModel';
import { CanjeDet } from 'src/app/models/canjeDet.model';

// guardarhistorial
interface CanjeStorage {
  fechaInicio: string;
  fechaFin: string;
  cargadorCliente: Cliente;
  cargadorUsuario: Usuarios;
  cargadorSucursal: Sucursal;
  size: number;
  page: number;
}

@Component({
  selector: 'app-list-canje',
  templateUrl: './canjeLista.component.html',
  styles: [``]
})
export class CanjeListaComponent implements OnInit {
  elementType = 'url';
  value: string = null;
  user: User;
  fechaRetiro: string;
  modal: string = 'oculto'; 
  tamanhoPag: string = 'md';
  cargadorUsuario: Usuarios;
  cargadorCliente: Cliente;
  cargadorSucursal: Sucursal;
  canjeStorage: CanjeStorage = null; // guardarhistorial
  seleccionMotivo: number;
  size: number;
  codUsuario: number;
  codCanje: number;
  fechaInicio: string;
  fechafin: string;
  cliente: Cliente;
  usuario: Usuarios;
  sucursal: Sucursal;
  sinResultado: boolean = false;
  cargando: boolean = false;
  oculto1: string = 'oculto';
  oculto2: string = 'oculto';
  detalles: CanjeDet[] = [];
  sucursales: Sucursal[] = [];
  usuarios: Usuarios[] = [];
  canjes: Canje[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/canjeLista/page';
  rutaDetalles: string = '/canjeLista/id';
  codSucursal: number;
  seleccionUsuario: number;
  page: number = 0;
  rol: string; 
  nroCanje: number = 0;

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

  constructor(private _canjesService: CanjesService,
    public _loginServices: LoginService,
    public _excelService: ExcelService,
    private _sucursalesServices: SucursalesService,
    private _usuariosServices: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }

  async ngOnInit() {
    this.nroCanje = 0; 
    this.codSucursal = 0;
    this.size = 20;
    this.cargadorCliente = null;
    this.cargadorUsuario = null;
    this.cargadorSucursal = null;
    this.rol = this._loginServices.user.authorities[0];
    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginServices.user.codSucursal;
      this.cargarSucursalPorId(this.codSucursal);
      this.cargarUsuarios(this.codSucursal);
    }
    this.codCanje = 0;
    console.log('rol,', this.rol);
    this.user = this._loginServices.user;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;
    /******************storage */
    if (localStorage.getItem('canjeStorage')) { // guardarhistorial
      this.canjeStorage = JSON.parse(localStorage.getItem('canjeStorage'));
      this.pagina = +localStorage.getItem('page');
      this.fechaInicio = this.canjeStorage.fechaInicio,
        this.fechafin = this.canjeStorage.fechaFin,
        this.cargadorCliente = this.canjeStorage.cargadorCliente,
        this.cargadorUsuario = this.canjeStorage.cargadorUsuario,
        this.cargadorSucursal = this.canjeStorage.cargadorSucursal,
        this.size = this.canjeStorage.size;
      this.page = this.pagina - 1;
      this.router.navigate([this.rutaPaginador, this.page]);
      this.loadPage(this.pagina);
    } else {
      this.router.navigate([this.rutaPaginador, this.page]);
      this.listar(this.page);
    }

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, this.page]);
    this.activatedRoute.paramMap.subscribe(params => {
      this.page = +params.get('page');
      if (!this.page) {
        this.page = 0;
        this.router.navigate([this.rutaPaginador, this.page]);
      }
      this.listar(this.page);
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
    this.cargando = true;
    this.listar(0);
  }

  listar(page) {
    let codSucursal = 0;
    if (this.codSucursal) {
      codSucursal = this.codSucursal;
    }
    this._canjesService.findByFecha(
      page,
      this.fechaInicio,
      this.fechafin,
      this.cargadorCliente,
      this.cargadorUsuario,
      codSucursal,
      this.size,
      null, null, this.nroCanje
    )
      .subscribe(async (r: any) => {
        console.log(r.content);
        this.canjes = r.content as Canje[];
        this.paginador = r;
        this.totalElementos = r.totalElements;
        this.cantidadElementos = r.size;
        localStorage.removeItem('canjeStorage'); // guardarhistorial
        localStorage.removeItem('page'); // guardarhistorial  
        if (this.paginador.empty === true) {
          this.sinResultado = true;
          this.canjes = [];
          this.cargando = false;
        } else {
          this.cargando = false;

        }
      });
  }

  export(): void {
    if (this.canjes.length > 0) {
      console.log(this.canjes);
      this._excelService.exportAsExcelFile(this.canjes, 'xlsx');
    } else {
      this.invalido('No se puede exportar datos de la nada!!!');
    }

  }

  verTodos() {
    this.cargadorCliente = null;
    this.cargadorUsuario = null;
    this.cargadorSucursal = null;
    this.fechaInicio = moment('2019-01-01').format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.listar(0);
  }



  cambioNumero(EVENTO) {
    this.size = EVENTO;
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
    this.canjeStorage = {
      page: 0,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechafin,
      cargadorCliente: this.cargadorCliente,
      cargadorUsuario: this.cargadorUsuario,
      cargadorSucursal: this.cargadorSucursal,
      size: this.size
    };

    localStorage.setItem('canjeStorage', JSON.stringify(this.canjeStorage));
    this.router.navigate([this.rutaDetalles, param]);
  }


  anular(canje: Canje) {
    if (canje && (canje.estado != 'CONCRETADO' && canje.anulado != true)) {
      Swal.fire({
        title: 'Está seguro?',
        text: `¿Seguro que desea anular el canje?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, anular!',
        cancelButtonText: 'No, cancelar!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        reverseButtons: true
      }).then((result) => {
        if (result.value) {

          this._canjesService.anular(canje.codCanje)
            .subscribe(
              json => {
                this.listar(this.page);
                swal.fire('Canje anulado ', 'Canje anulado con exito', 'success');
              },
              err => {
                if (!err.error) {
                  this.error('500 (Internal Server Error)');
                  return;
                }
                this.errores = err.error.errors;
                console.error('Código del error desde el backend: ' + err.status);
              }
            );

        }
      });
    } else {
      this.invalido('Verifica que el canje no se haya concretado o anulado !!!');
    }
  }

  seleccionarUsuario(item: Usuarios) {
    this.usuario = item;
    this.cargadorUsuario = item;
  }

  seleccionarCliente(item: Cliente) {
    this.cliente = item;
    this.cargadorCliente = item;
  }
  seleccionarSucursal(item: Sucursal) {
    this.sucursal = item;
    this.cargadorSucursal = item;
    (this.cargadorSucursal) ? this.codSucursal = this.cargadorSucursal.codSucursal : 0;
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  cerrarModal() {
    this.modal = 'oculto';
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 2200 });
    Swal.fire('Atención', invalido, 'warning');
  }




  cambioSucursal(EVENTO) {
    this.codSucursal = EVENTO;
    this.codUsuario = 0;
    this.seleccionUsuario = 0;
    if (this.codSucursal > 0) {
      this.cargarUsuarios(this.codSucursal);
    }

  }
  cambioUsuario(id) {
    this._usuariosServices.getUsuario(id).subscribe(cargadorUsuario => {
      this.cargadorUsuario = cargadorUsuario;
    });
  }


  cargarSucursalPorId(codSuc) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.cargadorSucursal = sucursal;
    });
  }

  cargarUsuarios(codSucursal) {
    this._usuariosServices.traerUsuariosPorSucursal(codSucursal).subscribe(usuarios => {
      let auxus: Usuarios = {
        enabled: true,
        codUsuario: 0,
        nombrePersona: 'TODOS',
        codPersonaErp: '8554',
        username: 'todos@cavallaro.com.py',
        rol: null,
        codEmpresa: 1,
        sucursal: null,
        intentoFallido: 0,
        bloqueado: false,
        createdAt: null,
        modifiedAt: null,
        createdBy: 'todos@todos.com',
        modifiedBy: 'admin@admin.com',
        img: '',
      };

      this.usuarios = usuarios;
      this.usuarios.push(auxus);
      this.codUsuario = 0;
      this.seleccionUsuario = 0;

    });
  }

  async cargarSucursalById(cod) {
    let sucursal = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return sucursal;
  } 
  async traerModeloPorId(cod) {
    let response = this._canjesService.getById(cod).toPromise();
    return response;
  }
  
}
