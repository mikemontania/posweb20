import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import * as moment from 'moment';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { LoginService } from '../../services/service.index';
import { User } from '../../models/user.model';
import { Usuarios } from '../../models/usuarios.model';
import { ResumenSucursal } from '../../models/resumenSucursal';
import { ResumenMedioPago } from '../../models/resumenMedioPago';

@Component({
  selector: 'chartDashResumen-mediopago',
  templateUrl: './chartDashResumen-mediopago.component.html',
  styleUrls: ['./chartDashResumen-mediopago.component.css']
})
export class ChartDashResumenMedioPago implements OnInit, OnChanges {
  public user: User;
  @Input() dashTema: string;
  @Input() fechaDesde: string;
  @Input() fechaHasta: string;
  @Input() codSucursal: number;
  @Input() codUsuario: number;
  public rol: string;
  public cargado: boolean;
  public seleccionTipo: number;
  public cargadorUsuario: Usuarios;
  public sucursales: Sucursal[] = [];
  public resumenMedioPago: ResumenMedioPago[] = [];
  public tipos: ObjetoSelector[] = [
    { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE' },
    { cod: 2, descripcion: 'CANTIDAD', enum: 'CANTIDAD' }
  ];
  public resumenResult: any[] = [];
  public totalcantidad: number;
  public totalImporte: number;
  public seleccionSucursal: number;

  constructor(private _loginService: LoginService,
    private _dashboardService: DashboardService,
    private _sucursalesServices: SucursalesService) { }
  ngOnInit() {
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
    this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
    this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
    this.totalImporte = 0;
    this.user = this._loginService.user;
    this.codUsuario = 0;
    this.user = this._loginService.user;
    this.cargarSucursales();
    // this.traerDatos(this.fechaDesde, this.fechaHasta, this.codUsuario, this.codSucursal);
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


  cambioSucursal(EVENTO) {
    //   console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
  }


  traerDatos(fechaInicio, fechaFin, codUsuario, codsucursal) {
    this.resumenResult = [];
    this.cargado = false;
    this._dashboardService.getResumenMediopago(fechaInicio, fechaFin, codUsuario, codsucursal).subscribe((respuesta: any) => {
      this.resumenMedioPago = respuesta;
      if (this.resumenMedioPago.length > 0 && this.seleccionTipo) {
        this.totalImporte = 0;
        this.totalcantidad = 0;
        let longitud = this.resumenMedioPago.length;
        console.log('longitud', longitud);
        for (let index = 0; index < this.resumenMedioPago.length; index++) {
          let data = 0;
          let ob = { name: '', value: 0 }
          if (this.resumenMedioPago[index]) {
            if (this.seleccionTipo == 1) {
              ob.value = this.resumenMedioPago[index].importeCobrado;
            }
            if (this.seleccionTipo == 2) {
              ob.value = this.resumenMedioPago[index].cantCobranzas;
            }
            ob.name = this.resumenMedioPago[index].medioPago;
            this.resumenResult.push(ob);
            this.totalImporte = this.totalImporte + this.resumenMedioPago[index].importeCobrado;
            this.totalcantidad = this.totalcantidad + this.resumenMedioPago[index].cantCobranzas;
          }

          if (index == (this.resumenMedioPago.length - 1)) {
            console.log(this.resumenResult);
            setTimeout(() => {
              //            console.log('hide');
              this.cargado = true;
            }, 500);

          }
        }
      } else {
        this.totalImporte = 0;
        this.totalcantidad = 0;
        //    console.log('sin resultado');
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
