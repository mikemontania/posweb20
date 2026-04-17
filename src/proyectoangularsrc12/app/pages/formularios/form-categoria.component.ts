import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { CategoriaProducto } from '../../models/categoriaProducto.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
@Component({
  selector: 'app-form-categoria',
  templateUrl: './form-categoria.component.html',
  styles: []
})
export class FormCategoriaComponent implements OnInit {
  categoria: CategoriaProducto  = new CategoriaProducto();
  user: User;
  seleccionMedioPago: number;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _categoriaServices: CategoriaService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.categoria.codEmpresa = this._loginService.user.codEmpresa;
   this.categoria.codCategoriaProducto = null;
   this.categoria.codCategoriaProductoErp = '';
   this.categoria.descripcion = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._categoriaServices.getById(id).subscribe((cate) => {
                this.categoria = cate;
              });
            }
          });
  }

  create(): void {
      this._categoriaServices.create(this.categoria)
        .subscribe(
          categoria => {
            this.router.navigate(['/categoria']);
            swal.fire('Nueva categoria', `La categoria ${this.categoria.descripcion} ha sido creada con éxito`, 'success');
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
    this._categoriaServices.update(this.categoria)
      .subscribe(
        json => {
          this.router.navigate(['/categoria']);
          swal.fire('Categoria Actualizada', `Categoria  : ${json.descripcion}`, 'success');
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
  invalido() {
    this.toastr.error('Favor completar todos los campos correctamente', 'Invalido',
    {timeOut: 1500});
  }
  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
