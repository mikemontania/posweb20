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
import { MotivoTransferencia } from '../../models/motivoTransferencia.model';
import { MotivoTransferenciaService } from '../../services/service.index';


@Component({
  selector: 'app-form-motivoTransferencia',
  templateUrl: './form-motivoTranferencia.component.html',
  styles: []
})
export class FormMotivoTransferenciaComponent implements OnInit {
  motivoTransferencia: MotivoTransferencia  = new MotivoTransferencia();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _motivoTransferenciaServices: MotivoTransferenciaService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.motivoTransferencia.codEmpresa = this._loginService.user.codEmpresa;
   this.motivoTransferencia.codMotivoTransferencia = null;
   this.motivoTransferencia.codMotivoTransferenciaErp = '';
   this.motivoTransferencia.descripcion = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._motivoTransferenciaServices.getById(id).subscribe((ba) => {
                this.motivoTransferencia = ba;
              });
            }
          });
  }

  create(): void {
      this._motivoTransferenciaServices.create(this.motivoTransferencia)
        .subscribe(
          bancos => {
            this.router.navigate(['/motivoTransferencia']);
            swal.fire('Nuevo motivo de anulación', `El motivo  ${this.motivoTransferencia.descripcion} ha sido creado con éxito`, 'success');
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
    this._motivoTransferenciaServices.update(this.motivoTransferencia)
      .subscribe(
        json => {
          this.router.navigate(['/motivoTransferencia']);
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
