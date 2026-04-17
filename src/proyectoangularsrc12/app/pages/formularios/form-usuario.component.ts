import {Component, OnInit} from '@angular/core';
import {Cliente} from '../../models/cliente.model';
import {
  ClienteService,
  MedioPagoService,
  CategoriaService,
  SucursalesService,
} from '../../services/service.index';
import {Router, ActivatedRoute} from '@angular/router';
import swal from 'sweetalert2';
import {UsuarioService} from '../../services/usuario/usuario.service';
import {User} from '../../models/user.model';
import {Empresas} from '../../models/empresas.model';
import {EmpresasService} from '../../services/empresas/empresas.service';
 import {ErrModel} from '../../models/ErrModel.model';
import {ToastrService} from 'ngx-toastr';
import {Usuarios} from '../../models/usuarios.model';
import {Sucursal} from '../../models/sucursal.model';
import {Rol} from '../../models/rol.model';
import {RolService} from '../../services/rol/rol.service';
import {LoginService} from '../../services/login/login.service';

@Component({
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.component.html',
  styles: [],
})
export class FormUsuarioComponent implements OnInit {
  cliente: Cliente;
  nombreProducto: string;
  nombreCliente: string;
  empresa: Empresas;
  imagenSubir: File;
  imagenTemp: any;
  sinImagen: string = './assets/images/users/user_img.png';
  sucursales: Sucursal[] = [];
  roles: Rol[] = [];
  seleccionSucursal: number;
  seleccionRol: number;
  user: User;
  usuario: Usuarios = new Usuarios();
  password: string;
  passwordCfr: string;
  seleccionUnidad: number;
  titulo: string = 'Crear Usuario';
  errores: ErrModel[] = [];

  constructor(
    private _categoriaServices: CategoriaService,
    private _rolServices: RolService,
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private _sucursalesServices: SucursalesService,
    private toastr: ToastrService,
    private _empresaServicies: EmpresasService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.usuario.codUsuario = null;
    this.usuario.nombrePersona = '';
    this.usuario.codPersonaErp = '';
    this.usuario.username = '';
    this.usuario.rol = null;
    this.usuario.enabled = true;
    this.usuario.codEmpresa = this._loginService.user.codEmpresa;
    this.usuario.sucursal = null;
    this.usuario.createdAt = null;
    this.usuario.modifiedAt = null;
    this.usuario.createdBy = this._loginService.user.username;
    this.usuario.modifiedBy = this._loginService.user.username;
    this.usuario.password = null;
    this.usuario.img = '';
    this.usuario.intentoFallido = 0;
    this.usuario.bloqueado = false;
    this.password = null;
    this.passwordCfr = null;
    this.seleccionRol = null;
    this.seleccionSucursal = null;
  }

  ngOnInit() {
    this.user = this._loginService.user;
    this._sucursalesServices
      .traerSucursales(this._loginService.user.codEmpresa)
      .subscribe(sucursales => {
        this.sucursales = sucursales;
        this._rolServices
          .traerRol(this._loginService.user.codEmpresa)
          .subscribe(roles => {
            this.roles = roles;
            this.activatedRoute.paramMap.subscribe(params => {
              let id = +params.get('id');
              if (id) {
                this._usuarioService.getUsuario(id).subscribe(usuario => {
                  console.log(usuario);
                  this.usuario = usuario;
                  this.seleccionSucursal = this.usuario.sucursal.codSucursal;
                  this.seleccionRol = this.usuario.rol.codRol;
                });
              } else {
                this.seleccionSucursal = null;
                this.seleccionRol = null;
              }
            });
          });
      });
    /*     this.cargarEmpresa();
    this.cargarCategoria();
    this.cargarUnidadMedida(); */
  }

  create(): any {
    if (!this.usuario.sucursal) {
      this.invalido('Sucursal no puede ir nulo');
      return;
    }
    if (!this.usuario.rol) {
      this.invalido('Rol no puede ir nulo');
      return;
    }
    // tslint:disable-next-line:triple-equals
    if (
      this.password === this.passwordCfr &&
      (this.password != null || this.password != '')
    ) {
      this.usuario.password = this.password; // tslint:disable-next-line:triple-equals
    } else {
      this.usuario.password = null;
      this.password = null;
      this.passwordCfr = null;
      this.invalido('las contraseñas deben ser identicas');
      return;
    }
    this._usuarioService.create(this.usuario).subscribe(
      (usuario: Usuarios) => {
        if (this.imagenSubir) {
          this._usuarioService
            .uploadImage(this.imagenSubir, usuario.codUsuario)
            .subscribe((usuario: Usuarios) => {
              this.usuario = usuario;
              this.imagenTemp = null;
              $('#uploadedfile').val(null);
            });
        }
        this.router.navigate(['/usuarios']);
        swal.fire(
          'Nuevo usuario',
          `El usuario ${this.usuario.username} ha sido creado con éxito`,
          'success'
        );
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

  update(): void {
    if (
      this.password === this.passwordCfr && (this.password != null ||
      this.password != '')
    ) {
      this.usuario.password = this.password;
    } else {
      this.usuario.password = '';
      this.password = '';
      this.passwordCfr = '';
      this.invalido('las contraseñas deben ser identicas');
      return;
    }
    this._usuarioService.update(this.usuario).subscribe(
      (json: Usuarios) => {
        this.router.navigate(['/usuarios']);
        //  console.log("json: " + json.usuario);
        if (this.imagenSubir) {
          this.cambiarImagen(this.usuario.codUsuario);
        }
        swal.fire(
          'Usuario Actualizado',
          `usuario  : ${json.username}`,
          'success'
        );
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

  seleccionImage(archivo: File) {
    // si  no existe no hacer nada
    if (!archivo) {
      this.imagenSubir = null;
      return;
    }
    if (archivo.type.indexOf('image') < 0) {
      swal.fire(
        'Sólo imágenes',
        'El archivo seleccionado no es una imagen',
        'error'
      );
      this.imagenSubir = null;
      return;
    }
    this.imagenSubir = archivo;
    let reader = new FileReader();
    let urlImagenTemp = reader.readAsDataURL(archivo);
    reader.onloadend = () => {
      console.log(reader.result);
      this.imagenTemp = reader.result;
    };
  }

  cambiarImagen(cod) {
    this._usuarioService
      .uploadImage(this.imagenSubir, cod)
      .subscribe((usuario: Usuarios) => {
        this.usuario = usuario;
        this.imagenTemp = null;
        $('#uploadedfile').val(null);
      });
    //  this._usuarioService.cambiarImagen( this.imagenSubir, this.usuario._id );
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', {timeOut: 1500});
  }

  error(err) {
    this.toastr.error(err, 'Error', {timeOut: 2500});
  }

  cambioSucursal(event) {
    for (let indice = 0; indice < this.sucursales.length; indice++) {
      if (this.sucursales[indice].codSucursal == this.seleccionSucursal) {
        this.usuario.sucursal = this.sucursales[indice];
      }
    }
  }

  cambioRol(event) {
    for (let indice = 0; indice < this.roles.length; indice++) {
      if (this.roles[indice].codRol == this.seleccionRol) {
        this.usuario.rol = this.roles[indice];
      }
    }
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
