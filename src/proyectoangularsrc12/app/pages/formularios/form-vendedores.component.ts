import { Component, OnInit } from '@angular/core';
import { VendedorService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from '../../models/user.model'; 
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { Vendedor } from '../../models/vendedor.model';
import { Usuarios } from '../../models/usuarios.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
@Component({
  selector: 'app-form-vend',
  templateUrl: './form-vendedores.component.html',
  styles: []
})
export class FormVendedoresComponent implements OnInit {
  vendedor: Vendedor = new Vendedor();
  usuarios: Usuarios[] = [];
  seleccionUsuario: number;
  user: User;
  errores: ErrModel[] = [];
  errors: ErrModel;

  constructor(
    private _vendedorService: VendedorService,
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _usuariosServices: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.vendedor.codEmpresa = this._loginService.user.codEmpresa;
    this.vendedor.codVendedorErp = '';
    this.vendedor.fechaCreacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    this.vendedor.docNro = '';
     this.vendedor.direccion = null;
    this.vendedor.telefono = null;
    this.vendedor.email = '';
     this.vendedor.porcentajeComision = 0;
    this.vendedor.tarjeta = null;
    this.vendedor.obs = null;
    this.vendedor.activo = true;
  }

  ngOnInit() {

    this.user = this._loginService.user;
    this._usuariosServices.traerEmpresasPorId(this._loginService.user.codEmpresa).subscribe(usuarios => {
      this.usuarios = usuarios;
      if (this.vendedor.activo == null) {
        this.vendedor.activo = true;
      }
 
      if (!this.vendedor.usuario) {
        this.seleccionUsuario = this.user.codUsuario;
        this.cambioUsuario(this.user.codUsuario);
      }
      this.activatedRoute.paramMap.subscribe(params => {
        let id = +params.get('id');
        if (id) {
          this._vendedorService.getVendedor(id).subscribe((vendedor) => {
            this.vendedor = vendedor;
            this.seleccionUsuario = this.vendedor.usuario.codUsuario;
          });
        }
      });
    });

  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  create() {
  
    if (!this.vendedor.docNro || this.vendedor.docNro.length < 4) {
      this.invalido('favor verificar nro de documento');
      return;
    }
    if (this.vendedor.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }

    this._vendedorService.create(this.vendedor)
      .subscribe(
        vendedor => {
          this.router.navigate(['/vendedores']);
          swal.fire('Nuevo vendedor', `El vendedor ${this.vendedor.vendedor} ha sido creado con éxito`, 'success');
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
    console.log(this.vendedor);
    if (!this.vendedor.activo) {
      this.invalido('Activo no puede ser nulo');
      return;
    }
    this._vendedorService.update(this.vendedor)
      .subscribe(
        (vendedor: Vendedor) => {
          this.router.navigate(['/vendedores']);
          swal.fire('Vendedor Actualizado', `vendedor  : ${vendedor.vendedor}`, 'success');
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



  cambioUsuario(event) {
    console.log(event);
    for (let indice = 0; indice < this.usuarios.length; indice++) {
      // tslint:disable-next-line:triple-equals
      if (this.usuarios[indice].codUsuario == this.seleccionUsuario) {
        this.vendedor.usuario = this.usuarios[indice];
      }
    }
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
