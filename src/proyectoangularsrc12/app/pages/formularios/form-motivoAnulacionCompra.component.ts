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
  import { MotivoAnulacionCompra } from '../../models/motivoAnulacionCompra.model';
import { MotivoAnulacionCompraService } from '../../services/service.index';


@Component({
  selector: 'app-form-motivoAnulacionCompra',
  templateUrl: './form-motivoAnulacionCompra.component.html',
  styles: []
})
export class FormMotivoAnulacionCompraComponent implements OnInit {
  motivoAnulacionCompra: MotivoAnulacionCompra  = new MotivoAnulacionCompra();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _motivoAnulacionCompraServices: MotivoAnulacionCompraService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.motivoAnulacionCompra.codEmpresa = this._loginService.user.codEmpresa;
   this.motivoAnulacionCompra.codMotivoCompra = null;
   this.motivoAnulacionCompra.codMotivoCompraErp = '';
   this.motivoAnulacionCompra.descripcion = '';
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._motivoAnulacionCompraServices.getById(id).subscribe((ba) => {
                this.motivoAnulacionCompra = ba;
              });
            }
          });
  }

  create(): void {
      this._motivoAnulacionCompraServices.create(this.motivoAnulacionCompra)
        .subscribe(
          bancos => {
            this.router.navigate(['/motivoAnulacionCompra']);
            swal.fire('Nuevo motivo de anulación', `El motivo  ${this.motivoAnulacionCompra.descripcion} ha sido creado con éxito`, 'success');
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
    this._motivoAnulacionCompraServices.update(this.motivoAnulacionCompra)
      .subscribe(
        json => {
          this.router.navigate(['/motivoAnulacionCompra']);
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
