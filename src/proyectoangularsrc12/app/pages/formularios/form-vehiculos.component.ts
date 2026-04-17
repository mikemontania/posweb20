import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { ErrModel } from '../../models/ErrModel.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { Vehiculo } from '../../models/vehiculo.model';
import { VehiculoService } from '../../services/service.index';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-form-vehiculos',
  templateUrl: './form-vehiculos.component.html',
  styles: []
})
export class FormVehiculosComponent implements OnInit {
  vehiculo: Vehiculo = new Vehiculo();
  user: User;
  errores: ErrModel[] = [];

  constructor(
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _vehiculoServices: VehiculoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.vehiculo.codVehiculo = null;
    this.vehiculo.codVehiculoErp = '';
    this.vehiculo.codEmpresa = this._loginService.user.codEmpresa;
    this.vehiculo.nroChasis = '';
    this.vehiculo.modelo = '';
    this.vehiculo.nroChapa = '';
    this.vehiculo.marca = '';
    this.vehiculo.color = '';
    this.vehiculo.combustible = '';
    this.vehiculo.transmision = '';
    this.vehiculo.codUltimoReparto = null;
    this.vehiculo.activo = null;
    this.vehiculo.fechaCreacion = null;
    this.vehiculo.fechaModificacion = null;
  }

  ngOnInit() {
    this.user = this._loginService.user;
    if (this.vehiculo.activo == null) {
      this.vehiculo.activo = true;
    }
    if (this.vehiculo.transmision == '') {
      this.vehiculo.transmision = 'MECANICO';
    }

    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._vehiculoServices.getById(id).subscribe((ve) => {
          this.vehiculo = ve;
        });
      }
    });
  }

  create(): void {
    this._vehiculoServices.create(this.vehiculo)
      .subscribe(
        bancos => {
          this.router.navigate(['/vehiculos']);
          swal.fire('Nuevo vehiculo', `El vehiculo ${this.vehiculo.modelo} ${this.vehiculo.nroChasis} ha sido creado con éxito`, 'success');
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
    this._vehiculoServices.update(this.vehiculo)
      .subscribe(
        json => {
          this.router.navigate(['/vehiculos']);
          swal.fire('Vehiculo Actualizado', `Vehiculo  : ${this.vehiculo.modelo} ${this.vehiculo.nroChasis} `, 'success');
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
      { timeOut: 1500 });
  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }

  
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
