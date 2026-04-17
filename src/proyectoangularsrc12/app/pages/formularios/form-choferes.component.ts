import { Component, OnInit } from '@angular/core';
import { Chofer } from '../../models/chofer.model';
import { ChoferService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { User } from '../../models/user.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-form-choferes',
  templateUrl: './form-choferes.component.html',
  styles: []
})
export class FormChoferComponent implements OnInit {
  chofer: Chofer = new Chofer();
  errores: ErrModel[] = [];
  errors: ErrModel;
  user: User;
  constructor(private _choferService: ChoferService,      private _loginService: LoginService,    private toastr: ToastrService,     private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.chofer.codEmpresa = this._loginService.user.codEmpresa;
    this.chofer.codChoferErp = '';
    this.chofer.chofer = '';
    this.chofer.docNro = '';
    this.chofer.tipoLicencia = '';
    this.chofer.licencia = '';
    this.chofer.codUltimoReparto = null;
    this.chofer.activo = null;
    this.chofer.fechaCreacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    this.chofer.fechaModificacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  }

  ngOnInit() {
    this.user = this._loginService.user;
            if (this.chofer.activo == null) {
              this.chofer.activo = true;
            }
            if (this.chofer.tipoLicencia == '') {
              this.chofer.tipoLicencia = 'PARTICULAR';
            }
            this.activatedRoute.paramMap.subscribe(params => {
              let id = +params.get('id');
              if (id) {
                this._choferService.getChoferById(id).subscribe((chofer) => {
                  this.chofer = chofer;
                });
              }
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

  create(): void {
    console.log(this.chofer);
     if (this.chofer.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }

    if (this.chofer.docNro == '') {
      this.invalido('Nro documento es requerido');
      return;
    }

    if (this.chofer.tipoLicencia == '') {
      this.invalido('tipo de licencia es requerida');
      return;
    }

    if (this.chofer.licencia == '') {
      this.invalido('licencia es requerida');
      return;
    }
 
    this._choferService.create(this.chofer)
      .subscribe(
        chofer => {
          this.router.navigate(['/choferes']);
          swal.fire('Nuevo chofer', `El chofer ${this.chofer.chofer} ha sido creado con éxito`, 'success');
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
    if (this.chofer.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }

    if (this.chofer.docNro == '') {
      this.invalido('Nro documento es requerido');
      return;
    }

    if (this.chofer.tipoLicencia == '') {
      this.invalido('tipo de licencia es requerida');
      return;
    }

    
    if (this.chofer.licencia == '') {
      this.invalido('licencia es requerida');
      return;
    }
    
    this._choferService.update(this.chofer)
      .subscribe(
        (chofer: Chofer) => {
          this.router.navigate(['/choferes']);
          swal.fire('Chofer Actualizado', `chofer  : ${chofer.chofer}`, 'success');
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
