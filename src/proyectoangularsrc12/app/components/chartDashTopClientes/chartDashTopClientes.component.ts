import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import * as moment from 'moment';
import { stringify } from '@angular/compiler/src/util';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { TopClientes } from '../../models/topClientes';
import { User } from '../../models/user.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { LoginService, SucursalesService } from '../../services/service.index';


@Component({
  selector: 'chartDashTopClientes',
  templateUrl: './chartDashTopClientes.component.html',
  styleUrls: ['./chartDashTopClientes.component.css'],
})
export class ChartDashTopClienteComponent implements OnInit, OnChanges {
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
    { cod: 2, descripcion: 'C. VENTAS', enum: 'CANTIDAD_VENTA' },
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
  public topResult: any[] = [];
  public topClientes: TopClientes[] = [];
  constructor(
    private _loginService: LoginService,
    private _dashboardService: DashboardService,
    private _sucursalesServices: SucursalesService
  ) { }
  ngOnInit() {
    this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
    this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
    this.totalImporte = 0;
    this.totalcantidadVenta = 0;
    this.user = this._loginService.user;
    this.seleccionNumero = 20;
    this.longitudDelArray = 0;
    this.seleccionTipo = 1;
    this.codUsuario = 0;
    this.codSucursal = 0;
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
    // console.log(EVENTO + ' - ' + this.seleccionTipo);
    this.seleccionTipo = EVENTO;
  }

  cambioNumero(EVENTO) {
    //  console.log(EVENTO + ' - ' + this.seleccionNumero);
    this.seleccionNumero = EVENTO;
  }
  cambioSucursal(EVENTO) {
    //  console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
  }

  traerDatos(fechaInicio, fechaFin, codUsuario, codsucursal) {
    this.topResult = [];
    this.cargado = false;
    this._dashboardService
      .getTopClientes(fechaInicio, fechaFin, codUsuario, codsucursal)
      .subscribe((respuesta: any) => {
        console.log(respuesta)
        this.topClientes = respuesta;
        if (this.topClientes.length > 0 && this.seleccionTipo) {
          //     console.log('content ', this.topClientes);
          this.totalImporte = 0;
          this.totalcantidadVenta = 0;
          //totales
          for (let x = 0; x < this.topClientes.length; x++) {
            this.totalImporte = this.totalImporte + this.topClientes[x].importeTotal;
            this.totalcantidadVenta = this.totalcantidadVenta + this.topClientes[x].cantVentas;
          }
          //orden
          if (this.seleccionTipo == 1) {
            this.topClientes.sort(function (a, b) {
              return b.importeTotal - a.importeTotal;
            });
            //     console.log('ordenado 1');
          }
          if (this.seleccionTipo == 2) {
            this.topClientes.sort(function (a, b) {
              return b.cantVentas - a.cantVentas;
            });
            //       console.log('ordenado 2');
          }
          let longitud = this.topClientes.length;
          if (longitud < this.seleccionNumero) {
            this.longitudDelArray = longitud;
          } else {
            this.longitudDelArray = this.seleccionNumero;
          }
          for (let index = 0; index < this.longitudDelArray; index++) {
            let topObjeto = { name: '', value: 0 }
            if (this.topClientes[index]) {
              // tslint:disable-next-line:triple-equals
              if (this.seleccionTipo == 1) {
                topObjeto.value = this.topClientes[index].importeTotal;
              }
              // tslint:disable-next-line:triple-equals
              if (this.seleccionTipo == 2) {
                topObjeto.value = this.topClientes[index].cantVentas;
              }
            }
            topObjeto.name = this.topClientes[index].razonSocial;
            this.topResult.push(topObjeto);
            // tslint:disable-next-line:triple-equals
            if (index == this.longitudDelArray - 1) {
              console.warn(this.topResult);
              setTimeout(() => {
                this.cargado = true;
              }, 500);
            }
          }
        } else {
          this.totalImporte = 0;
          this.totalcantidadVenta = 0;
          // this.clientesData = [{ data: [0], label: '' }, { data: [10], label: 'SIN RESULTADO' }];
          //  this.totalImporte = 0;
          this.cargado = false;
          //  console.log('sin resultado');
        }
      });
  }

  retornoUsuario(item: Usuarios) {
    //    console.log(item);
    this.cargadorUsuario = item;
    if (!item) {
      this.codUsuario = 0;
    } else {
      this.codUsuario = item.codUsuario;
    }
    //   console.log(this.codUsuario);
  }

  cargarSucursales() {
    this._sucursalesServices
      .traerSucursales(this._loginService.user.codEmpresa)
      .subscribe(resp => {
        //      console.log(resp);
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
