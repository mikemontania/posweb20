import { Component, OnInit } from '@angular/core';
import { ProveedorService } from '../../services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

import { User } from '../../models/user.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { Proveedor } from '../../models/proveedor.model';

@Component({
  selector: 'app-form-proveedor',
  templateUrl: './form-proveedor.component.html',
  styles: [` 
  agm-map {
    height: 400px;
  }`]
})
export class FormProveedorComponent implements OnInit {
  lat = -25.29688941637652;
  lng = -57.59492960130746;
  proveedor: Proveedor = new Proveedor();
  user: User;
  errores: ErrModel[] = [];
  errors: ErrModel;

  constructor(private _proveedorService: ProveedorService,
    private _loginService: LoginService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.proveedor.codEmpresa = this._loginService.user.codEmpresa;
    this.proveedor.codProveedorErp = '';
    this.proveedor.latitud = this.lat;
    this.proveedor.longitud = this.lng;
    this.proveedor.fechaCreacion = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    this.proveedor.codUltimaCompra = null;
    this.proveedor.direccion = null;
    this.proveedor.telefono = null;
    this.proveedor.email = '';
    this.proveedor.obs = null;
    this.proveedor.activo = null;
  }

  ngOnInit() {

    this.user = this._loginService.user;
    if (!this.proveedor.tipoDoc) {
      this.proveedor.tipoDoc = 'RUC';
    }

    if (this.proveedor.activo == null) {
      this.proveedor.activo = true;
    }

    this.proveedor.activo = true;
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._proveedorService.getById(id).subscribe((proveedor) => {
          this.proveedor = proveedor;
          if (id) {
            console.log(this.proveedor);
            this.lat = this.proveedor.latitud;
            this.lng = this.proveedor.longitud;
          }
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

    if (this.proveedor.activo == null) {
      this.invalido('Activo no puede ser nulo');
      return;
    }


    if (!this.proveedor.tipoDoc) {
      this.invalido('tipo de documento no puede ser nulo');
      return;
    }
    this._proveedorService.create(this.proveedor)
      .subscribe(
        proveedor => {
          this.router.navigate(['/proveedores']);
          swal.fire('Nuevo proveedor', `El proveedor ${this.proveedor.razonSocial} ha sido creado con éxito`, 'success');
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
    console.log(this.proveedor);
    if (!this.proveedor.activo) {
      this.invalido('Activo no puede ser nulo');
      return;
    }
    if (!this.proveedor.tipoDoc) {
      this.invalido('tipo de documento no puede ser nulo');
      return;
    }
    this._proveedorService.update(this.proveedor)
      .subscribe(
        (proveedor: Proveedor) => {
          this.router.navigate(['/proveedores']);
          swal.fire('proveedor Actualizado', `proveedor  : ${proveedor.razonSocial}`, 'success');
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

  agregarMarcador(evento) {
    console.log(evento);
    const coords: { lat: number, lng: number } = evento.coords;
    this.proveedor.latitud = coords.lat;
    this.proveedor.longitud = coords.lng;
  }


  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
