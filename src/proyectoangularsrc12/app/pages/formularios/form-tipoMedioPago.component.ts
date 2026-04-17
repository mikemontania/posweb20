import { Component, OnInit } from '@angular/core';
import { ClienteService, MedioPagoService, TipoMedioPagoService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MedioPago } from '../../models/medioPago.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';
import { LoginService } from '../../services/login/login.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-form-tipoMedioPago',
  templateUrl: './form-tipoMedioPago.component.html',
  styles: []
})
export class FormTipoMedioPagoComponent implements OnInit {
  tipoMedioPago: TipoMedioPago = new TipoMedioPago();
  medios: MedioPago[] = [];
  seleccionMedioPago: number;
  user: User;
  errores:  ErrModel[] = [];


  constructor(private _clienteService: ClienteService,
    private toastr: ToastrService,
    private _medioPagoServices: MedioPagoService,
    private _loginService: LoginService,
    private _tipoMedioPagoService: TipoMedioPagoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
        this.tipoMedioPago.descripcion = '';
        this.tipoMedioPago.codTipoMedioPagoErp = '';
        this.tipoMedioPago.codEmpresa =  this._loginService.user.codEmpresa;
        this.tipoMedioPago.medioPago = null;
        this.tipoMedioPago.descripcion = '';
    }

    ngOnInit() {
    this.user = this._loginService.user;
    this.cargarMedioPago();
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._tipoMedioPagoService.getById(id).subscribe((tipoMedioPago) => {
                this.tipoMedioPago = tipoMedioPago;
                this.seleccionMedioPago = this.tipoMedioPago.medioPago.codMedioPago;
              });
            }
          });
  }
    create(): void {
      if (!this.tipoMedioPago.medioPago) {
        this.invalido('Medio Pago no puede ser nulo');
        return;
      }
        this.tipoMedioPago.codEmpresa = this.user.codEmpresa;
        console.log(this.tipoMedioPago);
        this._tipoMedioPagoService.create(this.tipoMedioPago)
          .subscribe(
            (json: TipoMedioPago) => {
              this.router.navigate(['/tipoMedioPago']);
              swal.fire('Nuevo tipo de Medio Pago',
              `El tipo Medio Pago ${this.tipoMedioPago.descripcion} ha sido creado con éxito`, 'success');
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
    if (!this.tipoMedioPago.medioPago) {
      this.invalido('Medio Pago no puede ser nulo');
      return;
    }
      this._tipoMedioPagoService.update(this.tipoMedioPago)
        .subscribe(
          (json: TipoMedioPago) => {
            this.router.navigate(['/tipoMedioPago']);
            swal.fire('Tipo medio pago Actualizado', `Tipo medio pago  : ${json.descripcion}`, 'success');
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

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
    {timeOut: 1500});
  }
  error(err) {
    this.toastr.error(err, 'Error',
    {timeOut: 2500});
  }

    cargarMedioPago() {
      this._medioPagoServices.traerMedioPago(this.user.codEmpresa).subscribe(resp => {
        console.log(resp);
          this.medios = resp;
        });
      }

    cambioMedioPago(event) {
      for (let indice = 0; indice < this.medios.length; indice++) {
        // tslint:disable-next-line:triple-equals
        if (this.medios[indice].codMedioPago == this.seleccionMedioPago) {
          this.tipoMedioPago.medioPago = this.medios[indice];
        }
      }
    }

    toUpeCaseEvent(evento: string) {
      return evento.toLocaleUpperCase();
    }
}
