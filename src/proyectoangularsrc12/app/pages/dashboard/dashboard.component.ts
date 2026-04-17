import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
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
import { UsuarioService } from '../../services/usuario/usuario.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public dashTema: string;
  public user: User;
  public cargadorUsuario: Usuarios;
  public codUsuario: number;
  public codSucursal: number;
  public cargado: boolean;
  public fechaDesde: string = moment(new Date()).format('YYYY-MM-DD');
  public fechaHasta: string =  moment(new Date()).format('YYYY-MM-DD');
  public totalImporte: number;
  public totalcantidadVenta: number;
  public seleccionNumero: number;
  public longitudDelArray: number;
  public seleccionSucursal: number;
  public totalcantidad: number;
  public totalpeso: number;
  public sucursales: Sucursal[] = [];
  public usuarios: Usuarios[] = [];
  public seleccionUsuario: number;
  public barChartOptions: ChartOptions = {
    responsive: true
  };
  public seleccionTipo: number;
  public tipos: ObjetoSelector [] = [
    { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE'},
    { cod: 2, descripcion: 'CANTIDAD', enum: 'CANTIDAD'},
    { cod: 3, descripcion: 'C. VENTAS', enum: 'CANTIDAD_VENTA'},
    { cod: 4, descripcion: 'PESO', enum: 'PESO'}
  ];
  public numeros: ObjetoSelector [] = [
    { cod: 5, descripcion: '5', enum: '5'},
    { cod: 8, descripcion: '8', enum: '8'},
    { cod: 10, descripcion: '10', enum: '10'},
    { cod: 15, descripcion: '15', enum: '15'},
    { cod: 20, descripcion: '20', enum: '20'},
    { cod: 25, descripcion: '25', enum: '25'},
    { cod: 30, descripcion: '30', enum: '30'},
    { cod: 40, descripcion: '40', enum: '40'},
    { cod: 50, descripcion: '50', enum: '50'}
  ];
  public topProcuctos: TopProductos [] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [];
  public etiquetaProductos: Label[] = ['' ];
  public objeto =  { data: [], label: ''};
  public productosData: ChartDataSets[] = [  { data: [], label: '' }];
  public aux: any[] = [{ data: [], label: ''}];
  constructor(private _loginService: LoginService,
              private _dashboardService: DashboardService,
              private _sucursalesServices: SucursalesService,
              private _usuariosServices: UsuarioService
              ) { }

             
 
  ngOnInit() {
    this.user = this._loginService.user;
    this.seleccionSucursal = 0;
    this.totalImporte = 0;
    this.totalcantidad = 0;
    this.totalcantidadVenta = 0;
    this.totalpeso = 0;
    this.seleccionNumero = 20;
    this.longitudDelArray = 0;
    this.seleccionTipo = 1;
    this.codSucursal = 0;
    this.codUsuario = 0;
     
  }
   
 
 


}
