import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { LoginService, EmpresasService,   StockPremioService, SucursalesService, } from 'src/app/services/service.index';
import { Sucursal } from 'src/app/models/sucursal.model';
import { StockPremioCab } from 'src/app/models/stockPremioCab.model';
import { Premio } from 'src/app/models/premio.model ';
import { StockPremioDetalle } from 'src/app/models/stockPremioDet.model';
@Component({
  selector: 'app-mvStockPremio',
  templateUrl: './mvStockPremio.component.html',
  styleUrls: ['./mvStockPremio.component.css'],
})
export class MvStockPremioComponent implements OnInit {
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  cargadorSucursal: Sucursal;
  stockPremio: StockPremioCab = new StockPremioCab();
  stockPremioDet: StockPremioDetalle = new StockPremioDetalle();
  mostrarDetalles: boolean;
  operaciones: any[] = [];
  constructor(
    private toastr: ToastrService,
    private location: Location,
    public router: Router,
    public http: HttpClient,
    public _loginServices: LoginService,
    public _empresaServices: EmpresasService,
    private activatedRoute: ActivatedRoute,
    public _sucursalServices: SucursalesService,
    private _stockPremioService: StockPremioService,
  ) {
  }
  async ngOnInit() {
    this.stockPremio.codStockPremioCab = null;
    this.stockPremio.codEmpresa = this._loginServices.user.codEmpresa;
    this.stockPremio.codSucursal = this._loginServices.user.codSucursal
    this.stockPremio.codUsuario = this._loginServices.user.codUsuario;
    this.stockPremio.usuario = this._loginServices.user.username;
    this.cargadorSucursal = await this.findSucursal();
    this.mostrarDetalles = false;
    this.stockPremio.operacion = 'ENTRADA';
    this.stockPremio.nroComprobante = '';
    this.stockPremioDet.codStockPremioDet = null;
    this.stockPremioDet.cantidad = 1;
    this.stockPremioDet.operacion = 'ENTRADA';
    this.stockPremioDet.premio = null;
    this.stockPremio.detalle = [];
    this.mostrarDetalles = false;
    this.stockPremio.detalle = [];
  }



  async guardar() {


    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea grabar el movimiento ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, grabar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        console.log(this.stockPremio)
        this.stockPremio.cantidadItems = this.stockPremio.detalle.length;
        this._stockPremioService.create(this.stockPremio).subscribe(response => {
          Swal.fire('Se ha registrado con  exito el movimiento !!!', 'Finalizado!!!', 'success');
          this.ngOnInit();
        });
      }
    });
  }


  habilitarDetalles() {

    this.stockPremioDet.codStockPremioDet = null;
    this.stockPremioDet.cantidad = 1;
    this.stockPremioDet.operacion = 'ENTRADA';
    this.stockPremioDet.premio = null;
    if (this.stockPremio.operacion == 'OBSEQUIO') {
      this.stockPremioDet.operacion = 'SALIDA';
      this.operaciones = [{ descripcion: 'SALIDA' }]
    }
    if (this.stockPremio.operacion == 'ENTRADA') {
      this.stockPremioDet.operacion = 'ENTRADA';
      this.operaciones = [{ descripcion: 'ENTRADA' }]
      if (!this.stockPremio.nroComprobante || this.stockPremio.nroComprobante.length<12) {
        this.invalido('nro de comprobante es un campo obligatorio');
        return;
      }
    }

    if (this.stockPremio.operacion == 'INVENTARIO') {
      this.stockPremioDet.operacion = 'SALIDA';
      this.operaciones = [{ descripcion: 'ENTRADA' }, { descripcion: 'SALIDA' }]
    }
    this.mostrarDetalles = true;
  }



  opcabModelChange() {

  }
  opdetModelChange() {
    if (this.stockPremio.operacion == 'OBSEQUIO' && this.stockPremioDet.operacion == 'ENTRADA') {
      this.stockPremio.operacion = 'ENTRADA';
    }
    if (this.stockPremio.operacion == 'OBSEQUIO' && this.stockPremioDet.operacion == 'ENTRADA') {
      this.stockPremio.operacion = 'ENTRADA';
    }
  }



  agregarDetalle() {
    if (!this.stockPremioDet.premio) {
      this.invalido('Premio es un campo obligatorio');
      return;
    }
    if (!this.stockPremioDet.operacion) {
      this.invalido('operacion es un campo obligatorio');
      return;
    }

    if (!this.stockPremioDet.cantidad || this.stockPremioDet.cantidad <= 0) {
      this.invalido('cantidad es un campo obligatorio');
      return;
    }
    const indice = this.stockPremio.detalle.findIndex((d) => d.premio.codPremio == this.stockPremioDet.premio.codPremio && d.operacion == this.stockPremioDet.operacion);
    // =========== ==============     si no existe en el array ==================
    if (indice == -1) {
      console.log('NO EXISTE')
      this.stockPremio.detalle = [...this.stockPremio.detalle, { ...this.stockPremioDet }];
    } else {
      console.log('EXISTE')
      this.stockPremio.detalle[indice].cantidad = this.stockPremio.detalle[indice].cantidad + this.stockPremioDet.cantidad;
    }

  }
  quitarDetalle(index) {
    this.stockPremio.detalle.splice(index, 1);
  }

  seleccionarPremio(item: Premio) {
    console.log(item);
    this.stockPremioDet.premio = item;
  }


  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido', { timeOut: 2200 });
    Swal.fire('Atención', invalido, 'warning');
  }

  notificacion(mensaje: string) {
    this.toastr.success(mensaje, 'Exito!!!', {
      timeOut: 1500,
    });
  }
  toUpeCaseEvent(evento: string) {
    return evento.toLocaleUpperCase();
  }

  findSucursal() {
    let response = this._sucursalServices.getSucursalbyId(this._loginServices.user.codSucursal).toPromise();
    return response;
  }

  seleccionarSucursal(item: Sucursal) {
    if (item) {
      console.log(item);
      this.cargadorSucursal = item;
      this.stockPremio.codSucursal = item.codSucursal;
      console.log(this.cargadorSucursal);
    } else {
      this.cargadorSucursal = null;
      this.stockPremio.codSucursal = 0;
    }
  }
}
