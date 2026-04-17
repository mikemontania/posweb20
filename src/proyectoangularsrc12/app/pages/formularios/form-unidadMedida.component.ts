import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { UnidadMedidaService } from '../../services/unidadMedida/unidadMedida.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-form-unidad',
  templateUrl: './form-unidadMedia.component.html',
  styles: []
})
export class FormUnidadMedidaComponent implements OnInit {
  unidadMedida: UnidadMedida  = new UnidadMedida();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private _UnidadMedidaServices: UnidadMedidaService,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute) {
   this.unidadMedida.codEmpresa = this._loginService.user.codEmpresa;
   this.unidadMedida.codUnidad = null;
   this.unidadMedida.codUnidadErp = '';
   this.unidadMedida.cantidad = 0;
   this.unidadMedida.nombreUnidad = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._UnidadMedidaServices.getUnidad(id).subscribe((u) => {
                this.unidadMedida = u;
              });
            }
          });
  }

  create(): void {
      this._UnidadMedidaServices.create(this.unidadMedida)
        .subscribe(
          categoria => {
            this.router.navigate(['/unidadMedida']);
            swal.fire('Nueva unidad', `La unidad de medida: ${this.unidadMedida.nombreUnidad} ha sido creada con éxito`, 'success');
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
    this._UnidadMedidaServices.update(this.unidadMedida)
      .subscribe(
        (json: UnidadMedida) => {
          this.router.navigate(['/unidadMedida']);
          swal.fire('Unidad Actualizada', `Unidad  : ${json.nombreUnidad}`, 'success');
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
