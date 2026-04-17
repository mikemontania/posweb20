import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TopProductos } from '../../models/topProductos.model';
import * as moment from 'moment';
import { stringify } from '@angular/compiler/src/util';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { LoginService, UsuarioService } from '../../services/service.index';
import { User } from '../../models/user.model';
import { Usuarios } from '../../models/usuarios.model';

@Component({
  selector: 'dashFiltro',
  templateUrl: './dashFiltro.component.html'
})
export class DashFiltroComponent implements OnInit {
  @Output() dashTema: EventEmitter<string> = new EventEmitter();
  @Output() fecha_desde: EventEmitter<string> = new EventEmitter();
  @Output() fecha_hasta: EventEmitter<string> = new EventEmitter();
  @Output() cod_sucursal: EventEmitter<number> = new EventEmitter();
  @Output() cod_usuario: EventEmitter<number> = new EventEmitter();
  public tema: string;
  public user: User;
  public cargadorUsuario: Usuarios;
  public rol: string;
  public ocultarRol: boolean = true;
  public cargado: boolean;
  public fechaDesde: string = moment(new Date()).format('YYYY-MM-DD');
  public fechaHasta: string = moment(new Date()).format('YYYY-MM-DD');
  public codUsuario: number;
  public codSucursal: number;
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


  public temas: string[] = ['vivid', 'natural', 'cool', 'fire', 'solar',
    'air', 'aqua', 'flame', 'ocean', 'forest', 'horizon',
    'neons', 'picnic', 'night', 'nightLights']
  public seleccionTipo: number;
  public tipos: ObjetoSelector[] = [
    { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE' },
    { cod: 2, descripcion: 'CANTIDAD', enum: 'CANTIDAD' },
    { cod: 3, descripcion: 'C. VENTAS', enum: 'CANTIDAD_VENTA' },
    { cod: 4, descripcion: 'PESO', enum: 'PESO' }
  ];

  constructor(private _loginService: LoginService,
    private _dashboardService: DashboardService,
    private _sucursalesServices: SucursalesService,
    private _usuariosServices: UsuarioService) { }
  ngOnInit() {
    if (localStorage.getItem('dashtema')) {
      this.tema = localStorage.getItem('dashtema');
    } else {
      this.tema = 'vivid';
    }
    this.rol = this._loginService.user.authorities[0];
    console.log('rol,', this.rol);
    this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
    this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginService.user.codSucursal;
      this.cargarSucursalPorId();
      // this.ocultarRol = true;
    } else {
      this.seleccionSucursal = 0;
      this.codSucursal = 0;
      this.cargarSucursales();
      //  this.ocultarRol = false;
    }
    this.codUsuario = 0;
    this.refresh();
  }


  cambioTema(tema) {
    this.tema = tema;
    localStorage.setItem('dashtema', this.tema);
    this.dashTema.emit(tema);
    this.refresh();
  }

  cambioSucursal(EVENTO) {
    //  console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
    this.codUsuario = 0;
    this.seleccionUsuario = 0;
    if (this.codSucursal > 0) {
      this.cargarUsuarios(this.codSucursal);
    }

  }
  cambioUsuario(EVENTO) {
    //  console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionUsuario = EVENTO;
    this.codUsuario = EVENTO;
  }


  refresh() {
    this.fecha_hasta.emit(this.fechaHasta);
    this.fecha_desde.emit(this.fechaDesde);
    this.cod_sucursal.emit(this.codSucursal);
    this.cod_usuario.emit(this.codUsuario);
    this.dashTema.emit(this.tema);
    console.log('emitido');
  }

  cargarSucursales() {
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(resp => {
      //    console.log(resp);
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

  cargarSucursalPorId() {
    this._sucursalesServices.getSucursalbyId(this._loginService.user.codSucursal).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.seleccionSucursal = this._loginService.user.codSucursal;
      this.cargarUsuarios(this.codSucursal);
    });
  }

  cargarUsuarios(codSucursal) {
    this._usuariosServices.traerUsuariosPorSucursal(codSucursal).subscribe(usuarios => {
      //    console.log(resp);
      let auxus: Usuarios = {
        enabled: true,
        codUsuario: 0,
        nombrePersona: 'TODOS',
        codPersonaErp: '8554',
        username: 'todos@cavallaro.com.py',
        rol: null,
        codEmpresa: 1,
        sucursal: null,
        bloqueado:false,
        intentoFallido:0,
        createdAt: null,
        modifiedAt: null,
        createdBy: 'todos@todos.com',
        modifiedBy: 'admin@admin.com',
        img: '',
      };

      this.usuarios = usuarios;
      this.usuarios.push(auxus);
      this.codUsuario = 0;
      this.seleccionUsuario = 0;
      /* if (this.rol != 'ROLE_CAJERO') {
        this.usuarios.push(auxus);
        this.codUsuario = 0;
        this.seleccionUsuario = 0;
      } else {
        this.codUsuario = this._loginService.user.codUsuario;
        this.seleccionUsuario = this._loginService.user.codUsuario;
      } */
    });
  }

}
