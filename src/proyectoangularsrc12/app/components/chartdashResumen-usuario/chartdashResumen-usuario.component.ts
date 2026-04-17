import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TopProductos } from '../../models/topProductos.model';
import * as moment from 'moment';
import { stringify } from '@angular/compiler/src/util';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { LoginService } from '../../services/service.index';
import { User } from '../../models/user.model';
import { Usuarios } from '../../models/usuarios.model';
import { ResumenUsuario } from '../../models/resumenUsuario';

@Component({
  selector: 'chartdashResumen-usuario',
  templateUrl: './chartdashResumen-usuario.component.html',
  styleUrls: ['./chartdashResumen-usuario.component.css']
})
export class ChartDashResumenUsuarioComponent implements OnInit, OnChanges {
  @Input() dashTema: string;
  @Input() fechaDesde: string;
  @Input() fechaHasta: string;
  @Input() codSucursal: number;
  @Input() codUsuario: number;
  @Input() refresh: boolean;
  public user: User;
  public cargadorUsuario: Usuarios;

  public cargado: boolean;
  public rol: string;
  public totalImporte: number;
  public totalcantidadVenta: number;
  public seleccionNumero: number;
  public longitudDelArray: number;
  public seleccionSucursal: number;
  public sucursales: Sucursal[] = [];
  public seleccionTipo: number;
  public tipos: ObjetoSelector[] = [
    { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE' },
    { cod: 2, descripcion: 'CANTIDAD', enum: 'CANTIDAD' }
    /*     ,{ cod: 3, descripcion: 'C. VENTAS', enum: 'CANTIDAD_VENTA'},
        { cod: 4, descripcion: 'PESO', enum: 'PESO'} */
  ];
  public numeros: ObjetoSelector[] = [
    { cod: 5, descripcion: '5', enum: '5' },
    { cod: 8, descripcion: '8', enum: '8' },
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 15, descripcion: '15', enum: '15' },
    { cod: 20, descripcion: '20', enum: '20' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 40, descripcion: '40', enum: '40' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 80, descripcion: '80', enum: '80' },
    { cod: 100, descripcion: '100', enum: '100' }
  ];
  public resumenResult: any[] = [];
  public resumenUsuarios: ResumenUsuario[] = [];
  public objeto = { data: [], label: '' };
  public aux: any[] = [{ data: [], label: '' }];
  constructor(private _loginService: LoginService,
    private _dashboardService: DashboardService,
    private _sucursalesServices: SucursalesService) { }
  ngOnInit() {
    this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
    this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
    this.totalImporte = 0;
    this.totalcantidadVenta = 0;
    this.user = this._loginService.user;
    this.seleccionNumero = 15;
    this.longitudDelArray = 0;
    this.seleccionTipo = 1;
    this.rol = this._loginService.user.authorities[0];
    if (this.rol == 'ROLE_CAJERO') {
      this.seleccionSucursal = this._loginService.user.codSucursal;
      this.codSucursal = this._loginService.user.codSucursal;
    } else {
      this.seleccionSucursal = 0;
      this.codSucursal = 0;
      this.cargarSucursales();
    }
    this.codUsuario = 0;
    this.traerDatos(this.fechaDesde, this.fechaHasta, this.codUsuario, this.codSucursal);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges');
    console.log(this.fechaDesde);
    console.log(this.fechaHasta);
    console.log(this.codUsuario);
    console.log(this.codSucursal);
    if (this.fechaDesde) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codUsuario, this.codSucursal);

    } else if (this.fechaHasta) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codUsuario, this.codSucursal);
    } else if (this.codUsuario) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codUsuario, this.codSucursal);

    } else if (this.codSucursal) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codUsuario, this.codSucursal);

    }

  }

  cambio(EVENTO) {
    console.log(EVENTO + ' - ' + this.seleccionTipo);
    this.seleccionTipo = EVENTO;
  }

  cambioNumero(EVENTO) {
    console.log(EVENTO + ' - ' + this.seleccionNumero);
    this.seleccionNumero = EVENTO;
  }
  cambioSucursal(EVENTO) {
    console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
  }


  traerDatos(fechaInicio, fechaFin, codUsuario, codsucursal) {
    this.resumenResult = [];
    this.cargado = false;
    this._dashboardService.getResumenUsuario(fechaInicio, fechaFin, codUsuario, codsucursal).subscribe((respuesta: any) => {
      console.log('respuesta usu ', respuesta);
      this.resumenUsuarios = respuesta;
      if (this.resumenUsuarios.length > 0 && this.seleccionTipo) {
        console.log('content ', this.resumenUsuarios);
        this.totalImporte = 0;
        this.totalcantidadVenta = 0;
        if (this.seleccionTipo == 1) {
          this.resumenUsuarios.sort(function (a, b) {
            return b.importeTotal - a.importeTotal;
          });
          console.log('ordenado 1');
        }
        if (this.seleccionTipo == 2) {
          this.resumenUsuarios.sort(function (a, b) {
            return b.cantVentas - a.cantVentas;
          });
          console.log('ordenado 3');
        }
        let longitud = this.resumenUsuarios.length;
        if (longitud < this.seleccionNumero) {
          this.longitudDelArray = longitud;
        } else {
          this.longitudDelArray = this.seleccionNumero;
        }
        for (let j = 1; j < this.longitudDelArray; j++) {
          this.aux.push({ data: [], label: '' });
        }
        for (let index = 0; index < this.longitudDelArray; index++) {
          let ob = { name: '', value: 0 }
          console.log('tipo :  ', this.seleccionTipo);
          if (this.resumenUsuarios[index]) {
            // tslint:disable-next-line:triple-equals
            if (this.seleccionTipo == 1) {
              ob.value = this.resumenUsuarios[index].importeTotal;
            }
            if (this.seleccionTipo == 2) {
              ob.value = this.resumenUsuarios[index].cantVentas;
            }

          }
          ob.name = this.resumenUsuarios[index].nombrePersona;
          this.resumenResult.push(ob);
          this.totalImporte = this.totalImporte + this.resumenUsuarios[index].importeTotal;
          this.totalcantidadVenta = this.totalcantidadVenta + this.resumenUsuarios[index].cantVentas;
          // tslint:disable-next-line:triple-equals
          if (index == (this.longitudDelArray - 1)) {
            console.log(this.resumenResult);
            setTimeout(() => {
              console.log('hide');
              this.cargado = true;
            }, 500);
            console.log('aux:', this.aux);
          }
        }
      } else {

        this.totalImporte = 0;
        this.totalcantidadVenta = 0;
        this.cargado = false;
      }
    });
  }


  retornoUsuario(item: Usuarios) {
    console.log(item);
    this.cargadorUsuario = item;
    if (!item) {
      this.codUsuario = 0;
    } else {
      this.codUsuario = item.codUsuario;
    }
    console.log(this.codUsuario);
  }

  cargarSucursales() {
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(resp => {
      console.log(resp);
      this.sucursales = resp;
      let su: Sucursal = {
        codEmpresa: 0,
        codSucursal: 0,
        codSucursalErp: 'P000',
        direccion: '',
        email: '',
        nombreSucursal: 'TODAS LAS SUCURSALES',
        principal: false,
        telefono: '',
        modoVendedor: 'General',
        latitud: 0,
        longitud: 0,
        envioposventa:false,
        mensaje:''
      };
      this.sucursales.push(su);
    });
  }

}
