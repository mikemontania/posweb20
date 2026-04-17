import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Deposito } from '../../models/deposito.model';
import { DepositoService } from '../../services/deposito/deposito.service';
import { TipoDepositoService } from '../../services/tipoDeposito/tipoDeposito.service';
import { TipoDeposito } from '../../models/tipoDeposito.model';

@Component({
  selector: 'app-form-deposito',
  templateUrl: './form-deposito.component.html',
  styles: []
})

export class FormDepositoComponent implements OnInit {
  deposito: Deposito = new Deposito();
  sucursales: Sucursal[] = [];
  tipos: TipoDeposito[] = [];
  tipoDeposito: TipoDeposito;
  cargadorSucursal: Sucursal;
  constructor(
    private _loginService: LoginService,
    private _depositoServices: DepositoService,
    private _tipoDepositoServices: TipoDepositoService,
    private _sucursalesServices: SucursalesService,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute) {
    this.deposito.codEmpresa = this._loginService.user.codEmpresa;
    this.deposito.nombreDeposito = '';
    this.deposito.sucursal = null;
    this.deposito.codDepositoErp = '';
  }

  ngOnInit() {
    this.getTipoDeposito();
    this.getSucursalPorId();
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._depositoServices.getById(id).subscribe((deposito) => {
          this.deposito = deposito;
        });
      }

    });
  }

  create(): void {
    if (this.deposito.tipoVenta == true) {
      if (this.tipoDeposito.descripcion.indexOf('VEN', 0)) {

        this.atencion('El deposito no es de tipo venta');
        return;
      }
    }

    if (!this.deposito.tipoDeposito) {
      this.atencion('Tipo deposito no puede ser nulo');
      return;
    }
    console.log(this.deposito)
    this._depositoServices.create(this.deposito)
      .subscribe(
        dep => {
          this.router.navigate(['/depositos']);
          swal.fire('Nuevo deposito', `El deposito ${this.deposito.nombreDeposito} ha sido creada con éxito`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
          console.error('Código del error desde el backend: ' + err.status);
        }
      );
  }

  update(): void {
    console.log(this.deposito)
    this._depositoServices.update(this.deposito)
      .subscribe(
        (json: Deposito) => {
          this.router.navigate(['/depositos']);
          console.log('json: ' + json.nombreDeposito);
          swal.fire('Deposito Actualizado', `Deposito  : ${json.nombreDeposito}`, 'success');
        },
        err => {
          if (!err.error) {
            this.error('500 (Internal Server Error)');
            return;
          }
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

  atencion(err) {
    this.toastr.warning(err, 'Invalido',
      { timeOut: 2500 });
  }

  seleccionarSucursal(item: Sucursal) {
    this.deposito.sucursal = item;
    this.cargadorSucursal = item;
  }

  seleccionarTipoDeposito(item: TipoDeposito) {
    this.tipoDeposito = item;
    this.deposito.tipoDeposito = item;
    if (item.descripcion.includes('VEN')) {
      this.deposito.tipoVenta = true;
    } else {
      this.deposito.tipoVenta = false;
    }
  }

  getSucursalPorId() {
    this._sucursalesServices.getSucursalbyId(this._loginService.user.codSucursal).subscribe(sucursal => {
      this.cargadorSucursal = sucursal;
      this.deposito.sucursal = sucursal;
    });
  }

  getTipoDeposito() {
    this._tipoDepositoServices.getByCodEmpr(this._loginService.user.codEmpresa).subscribe(tipo => {
      this.tipos = tipo;
    });
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }
}
