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
import { FormaVenta } from '../../models/formaVenta.model';
import { FormaVentaService } from '../../services/formaVenta/formaVenta.service';
import { LoginService } from '../../services/login/login.service';


@Component({
  selector: 'app-form-formaVenta',
  templateUrl: './form-formaVenta.component.html',
  styles: []
})
export class FormFormaVentaComponent implements OnInit {
  formaVenta: FormaVenta  = new FormaVenta();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _formaVentaServices: FormaVentaService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.formaVenta.codFormaVenta = null;
   this.formaVenta.codEmpresa = this._loginService.user.codEmpresa;
   this.formaVenta.codFormaVentaErp = '';
   this.formaVenta.descripcion = '';
   this.formaVenta.esContado = true;
   this.formaVenta.cantDias = null;
    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._formaVentaServices.getFormaVentaById(id).subscribe((fo) => {
                this.formaVenta = fo;
              });
            }
          });
  }

  create(): void {
      this._formaVentaServices.create(this.formaVenta)
        .subscribe(
          formaVenta => {
            this.router.navigate(['/formaVenta']);
            swal.fire('Nueva forma', `La forma ${this.formaVenta.descripcion} ha sido creado con éxito`, 'success');
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
    this._formaVentaServices.update(this.formaVenta)
      .subscribe(
        json => {
          this.router.navigate(['/formaVenta']);
          swal.fire('Forma venta Actualizada', `Forma  : ${json.descripcion}`, 'success');
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
