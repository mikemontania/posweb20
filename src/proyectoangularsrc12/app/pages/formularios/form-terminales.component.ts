import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { User } from '../../models/user.model';
import { Sucursal } from '../../models/sucursal.model';
import * as moment from 'moment';
import { ErrModel } from '../../models/ErrModel.model';
import { Terminales } from '../../models/terminales.model';
import { TerminalService } from '../../services/terminales/terminales.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';

@Component({
  selector: 'app-form-terminales',
  templateUrl: './form-terminales.component.html',
  styles: []
})
export class FormTerminalesComponent implements OnInit {
  terminal: Terminales = new Terminales();
  seleccionMedioPago: number;
  errores: ErrModel[] = [];
  sucursales: Sucursal[] = [];
  seleccionSucursal: number;
  constructor(
    private _loginService: LoginService,
    private _terminalServices: TerminalService,
    private _sucursalesServices: SucursalesService,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute) {
    this.terminal.codEmpresa = this._loginService.user.codEmpresa;
    this.terminal.codTerminalVenta = null;
    this.terminal.descripcion = '';
    this.terminal.id = '';
    this.terminal.disponible = false;
    this.terminal.codSucursal = this._loginService.user.codSucursal;

  }

  ngOnInit() {
    this.traerSucursales();
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this._terminalServices.getTerminalById(id).subscribe((terminal) => {
          this.terminal = terminal;
          this.seleccionSucursal = this.terminal.codSucursal;
        });
      }

    });
  }

  create(): void {

    this.terminal.disponible = false;
    console.log(this.terminal)
    this._terminalServices.create(this.terminal)
      .subscribe(
        cliente => {
          this.router.navigate(['/terminales']);
          swal.fire('Nueva terminal', `La terminal ${this.terminal.descripcion} ha sido creada con éxito`, 'success');
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
    this.terminal.disponible = false;
    console.log(this.terminal)
    this._terminalServices.update(this.terminal)
      .subscribe(
        (json: Terminales) => {
          this.router.navigate(['/terminales']);
          console.log('json: ' + json.descripcion);
          swal.fire('Terminal Actualizada', `Terminal  : ${json.descripcion}`, 'success');
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

  cambioSucursal(event) {
    console.log(event)
    if (event > 0 && event != null) {
      this.seleccionSucursal = event;
      this.terminal.codSucursal = event;
    }
  }

  traerSucursales() {
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(sucursales => {
      this.sucursales = sucursales;
    });
  }

  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

}
