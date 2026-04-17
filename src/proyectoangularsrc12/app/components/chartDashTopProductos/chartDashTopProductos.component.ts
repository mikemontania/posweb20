import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TopProductos } from '../../models/topProductos.model';
import * as moment from 'moment';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { LoginService } from '../../services/service.index';
import { User } from '../../models/user.model';
import { Usuarios } from '../../models/usuarios.model';

@Component({
  selector: 'chartTopProductos',
  templateUrl: './chartDashTopProductos.component.html',
  styleUrls: ['./chartDashTopProductos.component.css']
})
export class ChartDashTopProductoComponent implements OnInit, OnChanges {
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
  public totalcantidadVenta: number;
  public seleccionNumero: number;
  public longitudDelArray: number;
  public seleccionSucursal: number;
  public totalcantidad: number;
  public totalpeso: number;
  public sucursales: Sucursal[] = [];
  public seleccionTipo: number;
  public tipos: ObjetoSelector[] = [
    { cod: 1, descripcion: 'IMPORTE', enum: 'IMPORTE' },
    { cod: 2, descripcion: 'CANTIDAD', enum: 'CANTIDAD' },
    { cod: 3, descripcion: 'C. VENTAS', enum: 'CANTIDAD_VENTA' },
    { cod: 4, descripcion: 'PESO', enum: 'PESO' }
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
    { cod: 100, descripcion: '100', enum: '100' },
    { cod: 120, descripcion: '120', enum: '120' },
    { cod: 150, descripcion: '150', enum: '150' }

  ];
  public topResult: any[] = [];
  public topProcuctos: TopProductos[] = [];
  public objeto = { data: [], label: '' };
  public aux: any[] = [{ data: [], label: '' }];
  constructor(private _loginService: LoginService,
    private _dashboardService: DashboardService,
    private _sucursalesServices: SucursalesService) { }
  ngOnInit() {
    this.totalImporte = 0;
    this.totalcantidad = 0;
    this.totalcantidadVenta = 0;
    this.totalpeso = 0;
    this.fechaDesde = moment(new Date()).format('YYYY-MM-DD');
    this.fechaHasta = moment(new Date()).format('YYYY-MM-DD');
    this.user = this._loginService.user;
    this.totalImporte = 0;
    this.totalcantidad = 0;
    this.totalcantidadVenta = 0;
    this.totalpeso = 0;
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
    this.totalcantidadVenta = 0;
    this.totalpeso = 0;
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
    this._dashboardService.getTopProductos(fechaInicio, fechaFin, codUsuario, codsucursal)
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.topProcuctos = respuesta;
        if (this.topProcuctos.length > 0 && this.seleccionTipo) {
          this.totalImporte = 0;
          this.totalcantidad = 0;
          this.totalcantidadVenta = 0;
          this.totalpeso = 0;
          //totales
          for (let x = 0; x < this.topProcuctos.length; x++) {
            this.totalImporte = this.totalImporte + this.topProcuctos[x].importeTotal;
            this.totalcantidad = this.totalcantidad + this.topProcuctos[x].cantidad;
            this.totalcantidadVenta = this.totalcantidadVenta + this.topProcuctos[x].cantVentas;
            this.totalpeso = this.totalpeso + this.topProcuctos[x].peso;
          }
          //orden
          if (this.seleccionTipo == 1) {
            this.topProcuctos.sort(function (a, b) {
              return b.importeTotal - a.importeTotal;
            });
          }
          if (this.seleccionTipo == 2) {
            this.topProcuctos.sort(function (a, b) {
              return b.cantidad - a.cantidad;
            });
          }
          if (this.seleccionTipo == 3) {
            this.topProcuctos.sort(function (a, b) {
              return b.cantVentas - a.cantVentas;
            });
          }
          if (this.seleccionTipo == 4) {
            this.topProcuctos.sort(function (a, b) {
              return b.peso - a.peso;
            });
          }
          let longitud = this.topProcuctos.length;
          if (longitud < this.seleccionNumero) {
            this.longitudDelArray = longitud;
          } else {
            this.longitudDelArray = this.seleccionNumero;
          }
          for (let index = 0; index < this.longitudDelArray; index++) {
            let topObjeto = { name: '', value: 0 }
            if (this.topProcuctos[index]) {
              // tslint:disable-next-line:triple-equals
              if (this.seleccionTipo == 1) {
                topObjeto.value = this.topProcuctos[index].importeTotal;
              }
              // tslint:disable-next-line:triple-equals
              if (this.seleccionTipo == 2) {
                topObjeto.value = this.topProcuctos[index].cantidad;
              }
              if (this.seleccionTipo == 3) {
                topObjeto.value = this.topProcuctos[index].cantVentas;
              }
              // tslint:disable-next-line:triple-equals
              if (this.seleccionTipo == 4) {
                topObjeto.value = this.topProcuctos[index].peso;
              }
            }
            topObjeto.name = this.topProcuctos[index].nombreProducto;
            this.topResult.push(topObjeto)
            if (index == (this.longitudDelArray - 1)) {
              setTimeout(() => {
                this.cargado = true;
              }, 500);
            }
          }
        } else {
          this.totalImporte = 0;
          this.totalcantidad = 0;
          this.totalcantidadVenta = 0;
          this.totalpeso = 0;
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
