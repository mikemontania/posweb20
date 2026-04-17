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
import { Usuarios } from 'src/app/models/usuarios.model';
import { ResumenCanal, ResumenMedioPago } from 'src/app/models/resumenMedioPago';


@Component({
  selector: 'chartDashResumen-canal',
  templateUrl: './chartDashResumen-canal.component.html',
  styleUrls: ['./chartDashResumen-canal.component.css']
})
export class ChartDashResumenCanalComponent implements OnInit, OnChanges {
   @Input() dashTema: string;
    @Input() fechaDesde: string;
    @Input() fechaHasta: string;
    @Input() codSucursal: number;
    @Input() codUsuario: number;
    @Input() refresh: boolean;
    public user: User;
    public cargadorUsuario: Usuarios;
    public rol: string;
    public cargado: boolean;

    public totalImporte: number;
    public seleccionNumero: number;
    public longitudDelArray: number;
    public seleccionSucursal: number;
    public totalcantidad: number;
    public sucursales: Sucursal[] = [];
    public seleccionTipo: number;
    public tipos: ObjetoSelector[] = [
      { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE' },
      { cod: 2, descripcion: 'CLIENTES', enum: 'CLIENTES' },
    ];

    public topResult: any[] = [];
    public resumenCanales: ResumenCanal[] = [];
   /* ObjetoresumenCanales  [
    {
        "codCanal": 1,
        "nombreCanal": "SALON",
        "cantidadClientes": 2,
        "totalImporte": 248760
    },
    {
        "codCanal": 4,
        "nombreCanal": "LLAMADA",
        "cantidadClientes": 1,
        "totalImporte": 68670
    },
    {
        "codCanal": 2,
        "nombreCanal": "WHATSAPP",
        "cantidadClientes": 1,
        "totalImporte": 56050
    }
] */
    public objeto = { data: [], label: '' };
    public aux: any[] = [{ data: [], label: '' }];
    constructor(private _loginService: LoginService,
      private _dashboardService: DashboardService,
      private _sucursalesServices: SucursalesService) { }
    ngOnInit() {
      this.totalImporte = 0;
      this.totalcantidad = 0;
       this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
      this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
      this.user = this._loginService.user;
      this.totalImporte = 0;
      this.totalcantidad = 0;
       this.seleccionNumero = 20;
      this.longitudDelArray = 0;
      this.seleccionTipo = 1;
      this.codUsuario = 0;
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
      this.totalImporte = 0;
      this.totalcantidad = 0;
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
  this._dashboardService.getResumenCanal(fechaInicio, fechaFin, codsucursal)
    .subscribe((respuesta: any) => {
      console.log(respuesta);
      this.resumenCanales = respuesta;
      if (this.resumenCanales.length > 0 && this.seleccionTipo) {
        this.totalImporte = 0;
        this.totalcantidad = 0;

        // totales
        for (let x = 0; x < this.resumenCanales.length; x++) {
          this.totalImporte += this.resumenCanales[x].totalImporte;
          this.totalcantidad += this.resumenCanales[x].cantidadClientes;
        }

        // orden
        if (this.seleccionTipo == 1) {
          this.resumenCanales.sort((a, b) => b.totalImporte - a.totalImporte);
        }
        if (this.seleccionTipo == 2) {
          this.resumenCanales.sort((a, b) => b.cantidadClientes - a.cantidadClientes);
        }

        let longitud = this.resumenCanales.length;
        this.longitudDelArray = longitud < this.seleccionNumero ? longitud : this.seleccionNumero;

        for (let index = 0; index < this.longitudDelArray; index++) {
          let topObjeto = { name: '', value: 0 };

          if (this.resumenCanales[index]) {
            if (this.seleccionTipo == 1) {
              topObjeto.value = this.resumenCanales[index].totalImporte;
            }
            if (this.seleccionTipo == 2) {
              topObjeto.value = this.resumenCanales[index].cantidadClientes;
            }

            // 👇 ahora usamos el nombre del canal real
            topObjeto.name = this.resumenCanales[index].nombreCanal;
          }

          this.topResult.push(topObjeto);

          if (index === this.longitudDelArray - 1) {
            setTimeout(() => {
              this.cargado = true;
            }, 500);
          }
        }
      } else {
        this.totalImporte = 0;
        this.totalcantidad = 0;
        this.cargado = false;
      }
    });
}



    retornoUsuario(item: Usuarios) {
      //   console.log(item);
      this.cargadorUsuario = item;
      if (!item) {
        this.codUsuario = 0;
      } else {
        this.codUsuario = item.codUsuario;
      }
      //    console.log(this.codUsuario);
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

  }
