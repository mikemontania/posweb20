import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import * as moment from 'moment';
import { stringify } from '@angular/compiler/src/util';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { LoginService } from '../../services/service.index';
import { User } from '../../models/user.model';
import { ResumenSucursal } from '../../models/resumenSucursal';


@Component({
  selector: 'chartDashResumen-reparto',
  templateUrl: './chartDashResumen-reparto.component.html',
  styleUrls: ['./chartDashResumen-reparto.component.css']
})
export class ChartDashResumenRepartoComponent implements OnInit, OnChanges {
  public rol: string;
  public user: User;
  public cargado: boolean;
  @Input() dashTema: string;
  @Input() fechaDesde: string;
  @Input() fechaHasta: string;
  @Input() codSucursal: number;
  public totalImporte: number;
  public totalcantidadVenta: number;
  public seleccionSucursal: number;
  public sucursales: Sucursal[] = [];
  public seleccionTipo: number;
  public tipos: ObjetoSelector[] = [
    { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE' },
    { cod: 2, descripcion: 'C. VENTAS', enum: 'CANTIDAD_VENTA' }
  ];
  public resumenResult: any[] = [];
  public resumenSucursal: ResumenSucursal[] = [];
  public etiqueta: Label[] = [''];
  constructor(private _loginService: LoginService,
    private _dashboardService: DashboardService,
    private _sucursalesServices: SucursalesService) { }
  ngOnInit() {
    this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
    this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
    this.user = this._loginService.user;
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
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges');
    console.log(this.fechaDesde);
    console.log(this.fechaHasta);
    console.log(this.codSucursal);
    if (this.fechaDesde) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codSucursal);

    } else if (this.fechaHasta) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codSucursal);

    } else if (this.codSucursal) {

      this.traerDatos(this.fechaDesde, this.fechaHasta, this.codSucursal);

    }

  }

  cambio(EVENTO) {
    console.log(EVENTO + ' - ' + this.seleccionTipo);
    this.seleccionTipo = EVENTO;
  }


  cambioSucursal(EVENTO) {
    console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
  }


  traerDatos(fechaInicio, fechaFin, codsucursal) {
    this.resumenResult = [];
    this.cargado = false;
    this._dashboardService.getResumenReparto(fechaInicio, fechaFin, codsucursal).subscribe((respuesta: any) => {
      this.resumenSucursal = respuesta;
      if (this.resumenSucursal.length > 0 && this.seleccionTipo) {
        console.log('resumenSucursal ', this.resumenSucursal);
        this.totalImporte = 0;
        this.totalcantidadVenta = 0;
        let longitud = this.resumenSucursal.length;
        console.log('longitud', longitud);
        for (let index = 0; index < this.resumenSucursal.length; index++) {
          let ob = { name: '', value: 0 }
          if (this.resumenSucursal[index]) {
            // tslint:disable-next-line:triple-equals
            if (this.seleccionTipo == 1) {
              ob.value = this.resumenSucursal[index].importeTotal;
            }
            if (this.seleccionTipo == 2) {
              ob.value = this.resumenSucursal[index].cantVentas;
            }
            ob.name = this.resumenSucursal[index].nombreSucursal;
            this.resumenResult.push(ob);
            console.log(this.resumenSucursal[index]);
            this.totalImporte = this.totalImporte + this.resumenSucursal[index].importeTotal;
            this.totalcantidadVenta = this.totalcantidadVenta + this.resumenSucursal[index].cantVentas;
          }

          if (index == (this.resumenSucursal.length - 1)) {
            setTimeout(() => {
              console.log('hide');
              this.cargado = true;
            }, 500);

          }
        }
      } else {
        this.totalImporte = 0;
        this.totalcantidadVenta = 0;
        this.cargado = false;
        console.log('sin resultado');
      }
    });
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
        modoVendedor: 'GENERAL',
        latitud: 0,
        longitud: 0,
        envioposventa:false,
        mensaje:''
      };
      this.sucursales.push(su);
    });
  }

}
