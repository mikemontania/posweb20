import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
@Component({
  selector: 'app-form-sucursales',
  templateUrl: './form-sucursales.component.html',
  styles: [`
  agm-map {
    height: 400px;
  }`]
})
export class FormSucursalesComponent implements OnInit {
  lat = -25.29688941637652;
  lng = -57.59492960130746;
  sucursal: Sucursal  = new Sucursal();
  user: User;
  errores:  ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _sucursalesServices: SucursalesService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
   this.sucursal.codEmpresa = this._loginService.user.codEmpresa;
   this.sucursal.codSucursal = null;
   this.sucursal.codSucursalErp = '';
   this.sucursal.direccion = '';
   this.sucursal.email = '';
   this.sucursal.centro = '';
   this.sucursal.nombreSucursal = '';
   this.sucursal.principal = false;
   this.sucursal.telefono = '';
   this.sucursal.modoVendedor = 'GENERAL';
   this.sucursal.latitud = this.lat;
   this.sucursal.longitud = this.lng;
   this.sucursal.envioposventa = false;
   this.sucursal.mensaje = '';

    }

  ngOnInit() {
    this.user = this._loginService.user;
          this.activatedRoute.paramMap.subscribe(params => {
            let id = +params.get('id');
            if (id) {
              this._sucursalesServices.getSucursalbyId(id).subscribe((sucursal) => {
                this.sucursal = sucursal;
                this.lat = this.sucursal.latitud;
                this.lng = this.sucursal.longitud;
                console.log('id : ' + id);
              });
            }
          });
  }

  create(): void {
      this._sucursalesServices.create(this.sucursal)
        .subscribe(
          cliente => {
            this.router.navigate(['/sucursales']);
            swal.fire('Nueva sucursal', `La sucursal ${this.sucursal.nombreSucursal} ha sido creada con éxito`, 'success');
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
    this._sucursalesServices.update(this.sucursal)
      .subscribe(
        json => {
          this.router.navigate(['/sucursales']);
          console.log('json: ' + json.Cliente);
          swal.fire('Sucursal Actualizada', `sucursal  : ${json.nombreSucursal}`, 'success');
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

  agregarMarcador(evento) {
    console.log(evento);
    const coords: { lat: number, lng: number } = evento.coords;
    this.sucursal.latitud = coords.lat;
    this.sucursal.longitud = coords.lng;
  }

}
