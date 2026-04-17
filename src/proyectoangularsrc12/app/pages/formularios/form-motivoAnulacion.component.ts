import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
 import { ToastrService } from 'ngx-toastr';
 import { LoginService } from '../../services/login/login.service';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { MotivoAnulacionService } from '../../services/motivoAnulacion/motivoAnulacion.service';


@Component({
  selector: 'app-form-motivoAnulacion',
  templateUrl: './form-motivoAnulacion.component.html',
  styles: []
})
export class FormMotivoAnulacionComponent implements OnInit {
  motivoAnulacion: MotivoAnulacion  = new MotivoAnulacion();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _motivoAnulacionServices: MotivoAnulacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.motivoAnulacion.codEmpresa = this._loginService.user.codEmpresa;
   this.motivoAnulacion.codMotivoAnulacion = null;
   this.motivoAnulacion.codMotivoAnulacionErp = '';
   this.motivoAnulacion.descripcion = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._motivoAnulacionServices.getById(id).subscribe((ba) => {
                this.motivoAnulacion = ba;
              });
            }
          });
  }

  create(): void {
      this._motivoAnulacionServices.create(this.motivoAnulacion)
        .subscribe(
          bancos => {
            this.router.navigate(['/motivoAnulacion']);
            swal.fire('Nuevo motivo de anulación', `El motivo  ${this.motivoAnulacion.descripcion} ha sido creado con éxito`, 'success');
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
    this._motivoAnulacionServices.update(this.motivoAnulacion)
      .subscribe(
        json => {
          this.router.navigate(['/motivoAnulacion']);
          swal.fire('Motivo Actualizado', `Motivo  : ${json.descripcion}`, 'success');
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
