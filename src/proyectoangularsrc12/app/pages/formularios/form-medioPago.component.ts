import { Component, OnInit } from '@angular/core';
import {   MedioPagoService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { MedioPago } from '../../models/medioPago.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-form-medioPago',
  templateUrl: './form-medioPago.component.html',
  styles: []
})
export class FormMedioPagoComponent implements OnInit {
  medioPago: MedioPago  = new MedioPago();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private _medioPagoServices: MedioPagoService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.medioPago.codEmpresa = this._loginService.user.codEmpresa;
   this.medioPago.codMedioPago = null;
   this.medioPago.codMedioPagoErp = '';
   this.medioPago.descripcion = '';
   this.medioPago.esCheque = null;
   this.medioPago.tieneBanco = null;
   this.medioPago.tieneRef = null;
   this.medioPago.tieneRef = null;
   this.medioPago.esObsequio = false;
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._medioPagoServices.getMedioPagoById(id).subscribe((medioPago) => {
                this.medioPago = medioPago;
                console.log('id : ' + id);
              });
            }
          });
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
    {timeOut: 1500});
  }
  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }

  create(): void {
      if (this.medioPago.esCheque == null) {
        this.invalido('esCheque no puede ser nulo');
        return;
      }
      if (this.medioPago.tieneRef == null) {
        this.invalido('tieneRef no puede ser nulo');
        return;
      }
      if (this.medioPago.tieneTipo == null) {
        this.invalido('tieneTipo no puede ser nulo');
        return;
      }
      if (this.medioPago.tieneBanco == null) {
        this.invalido('tieneBanco no puede ser nulo');
        return;
      }
      this._medioPagoServices.create(this.medioPago)
        .subscribe(
          cliente => {
            this.router.navigate(['/medioPago']);
            swal.fire('Nuevo Medio de pago', `El medio de pago ${this.medioPago.descripcion} ha sido creado con éxito`, 'success');
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
    this._medioPagoServices.update(this.medioPago)
      .subscribe(
        json => {
          this.router.navigate(['/medioPago']);
          swal.fire('Medio De Pago Actualizado', `Medio de pago  : ${json.descripcion}`, 'success');
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
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
