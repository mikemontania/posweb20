import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2'; 
import { User } from '../../models/user.model'; 
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { GrupoDescuento } from '../../models/grupoDescuento.model';
import { GrupoDescuentoService } from '../../services/grupoDescuento/grupoDescuento.service';
import { LoginService } from '../../services/login/login.service';


@Component({
  selector: 'app-form-grupoDescuento',
  templateUrl: './form-grupoDescuento.component.html',
  styles: []
})
export class FormGrupoDescuentoComponent implements OnInit {
  grupoDescuento: GrupoDescuento  = new GrupoDescuento();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _grupoDescuentoServices: GrupoDescuentoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.grupoDescuento.codGrupo = null;
   this.grupoDescuento.codEmpresa = this._loginService.user.codEmpresa;
  this.grupoDescuento.descripcion = '';
   this.grupoDescuento.descuento = 0;
     }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._grupoDescuentoServices.getGrupoById(id).subscribe((g) => {
                this.grupoDescuento = g;
              });
            }
          });
  }

  create(): void {
      this._grupoDescuentoServices.create(this.grupoDescuento)
        .subscribe(
          grupoDescuento => {
            this.router.navigate(['/grupoDescuento']);
            swal.fire('Nueva grupo', `El grupo ${this.grupoDescuento.descripcion} ha sido creado con éxito`, 'success');
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
    this._grupoDescuentoServices.update(this.grupoDescuento)
      .subscribe(
        json => {
          this.router.navigate(['/grupoDescuento']);
          swal.fire('Grupo Actualizado', `Grupo  : ${json.descripcion}`, 'success');
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
