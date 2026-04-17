

import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto.model';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VentasService } from '../../services/ventas/ventas.service';
import { Venta } from '../../models/venta.model';
import { Detalles } from '../../models/detalles.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cobranza } from '../../models/cobranza.model';
import { Cliente } from '../../models/cliente.model';
import { response } from 'express';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { MotivoAnulacionService } from '../../services/motivoAnulacion/motivoAnulacion.service';
import { User } from '../../models/user.model';
import { LoginService, SucursalesService, UsuarioService } from '../../services/service.index';
import { StockService } from '../../services/stock/stock.service';
import { Vendedor } from '../../models/vendedor.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reporte-vendedores',
  templateUrl: './vendedoresReporte.component.html',
  styles: [``]
})
export class VendedoresReporteComponent implements OnInit {

  user: User;
  tamanhoPag: string = 'md';
  modalAnulacion: string = 'oculto';
  cargadorVendedor: Vendedor;
  cargadorSucursal: Sucursal;
  seleccionMotivo: number;
  size: number;
  codUsuario: number;
  codVenta: number;
  fechaInicio: string;
  nroComprobante: string;
  estado: string;
  fechafin: string;
  cliente: Cliente;
  usuario: Usuarios;
  sucursal: Sucursal;
  sinResultado: boolean = false;
  cargando: boolean = false;
  sucursales: Sucursal[] = [];
  ventas: Venta[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  codSucursal: number;
  seleccionUsuario: number;
  seleccionSucursal: number;
  rol: string;


  constructor(private _ventasService: VentasService,
    public _loginServices: LoginService,
    public _ventaServices: VentasService,
    private _AnulacionService: MotivoAnulacionService,
    private _sucursalesServices: SucursalesService,
    private _usuariosServices: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }

  async ngOnInit() {

    this.codSucursal = this._loginServices.user.codSucursal;
    this.cargadorSucursal = await this.cargarSucursalById(this.codSucursal);
    this.cargando = true;
    this.size = 20;
    this.cargadorVendedor = null;
    this.nroComprobante = '';
    this.estado = null;
    this.codVenta = 0;
    this.rol = this._loginServices.user.authorities[0];
    this.user = this._loginServices.user;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;


    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginServices.user.codSucursal;
      this.cargarSucursalPorId(this.codSucursal);
    }

  }

  seleccionarSucursal(item: Sucursal) {
    this.sucursal = item;
    this.cargadorSucursal = item;
  }
  seleccionarVendedor(item: Vendedor) {
    this.cargadorVendedor = item;
  }
  async cargarSucursalById(cod) {
    let sucursal = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return sucursal;
  }

  cambioSucursal(EVENTO) {
    //  console.log(EVENTO + ' - ' + this.seleccionSucursal);
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
    this.codUsuario = 0;
    this.seleccionUsuario = 0;
  }

  cargarSucursalPorId(codSuc) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.seleccionSucursal = codSuc;
      this.cargadorSucursal = sucursal;

    });
  }

  verReporte() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();

    let codVendedor = 0;
    let codSucursal = this._loginServices.user.codSucursal;
    if (this.cargadorVendedor) {
      codVendedor = this.cargadorVendedor.codVendedor;
    }
    if (this.cargadorSucursal) {
      codSucursal = this.cargadorSucursal.codSucursal;
    }
    this._ventaServices.verReporteVendedoresPdf(this.fechaInicio, this.fechafin, this._loginServices.user.codEmpresa, codSucursal, codVendedor).subscribe((response: any) => {
      Swal.close();
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }

}


