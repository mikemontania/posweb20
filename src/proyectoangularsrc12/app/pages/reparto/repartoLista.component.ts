import { Component, OnInit, OnChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VentasService } from '../../services/ventas/ventas.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService, UsuarioService, PedidosService, RepartoService } from '../../services/service.index';
import { Chofer } from '../../models/chofer.model';
import { Pedido } from '../../models/pedido.model';
import { Venta } from '../../models/venta.model';
import * as moment from 'moment';
import { Vehiculo } from '../../models/vehiculo.model';
import { Reparto } from '../../models/reparto.model';
import { RepartoDetalle } from '../../models/repartoDetalle.model';
import { RepartoDocs } from '../../models/repartoDocs.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { Cliente } from '../../models/cliente.model';
import { Usuarios } from '../../models/usuarios.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';

// guardarhistorial
interface VentasStorage {
  fechaInicio: string;
  fechaFin: string;
  cargadorCliente: Cliente;
  cargadorUsuario: Usuarios;
  cargadorSucursal: Sucursal;
  nroComprobante: string;
  estado: string;
  size: number;
  page: number;
}

@Component({
  selector: 'app-reparto-lista',
  templateUrl: './repartoLista.component.html',
  styles: [``]
})
export class RepartoListaComponent implements OnInit {
  _modoVista: string = 'LISTADO';
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  reparto: Reparto;
  repartoDetalles: RepartoDetalle[] = [];
  repartoDocs: RepartoDocs[] = [];
  paginaDocs: number = 0;
  pageSizeDocs: number = 0;
  paginaDetalles: number = 0;
  pageSizeDetalles: number = 0;
  paginaReparto: number = 0;
  pageSizeReparto: number = 0;
  listaReparto: Reparto[] = [];
  sucursales: Sucursal[] = [];
  sucursal: Sucursal;
  codSucursal: number;
  cargadorSucursal: Sucursal;
  seleccionSucursal: number;
  rol: string;
  fechaInicio: string;
  fechaFin: string;
  totalElementos: number = 0;
  fechaReparto: string;
  tamanhoPag: number = 10;
  chofer: Chofer;
  cargadorChofer: Chofer;
  ayudante1: Chofer;
  cargadorAyudante1: Chofer;
  ayudante2: Chofer;
  cargadorAyudante2: Chofer;
  sinImagen: string = './assets/images/sin-imagen.jpg';
  totalkg: number = 0;
  totalGs: number = 0;
  vehiculo: Vehiculo;
  cargadorVehiculo: Vehiculo;
  public numeros: ObjetoSelector[] = [
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 15, descripcion: '15', enum: '15' },
    { cod: 20, descripcion: '20', enum: '20' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 40, descripcion: '40', enum: '40' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 100, descripcion: '100', enum: '100' }
  ];
  constructor(private _ventasService: VentasService,
    private _pedidosServices: PedidosService,
    private _sucursalesServices: SucursalesService,
    public _loginServices: LoginService,
    private _usuariosServices: UsuarioService,
    private _repartoServices: RepartoService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }


  async ngOnInit() {
    this.rol = this._loginServices.user.authorities[0];
    this.totalkg = 0;
    this.totalGs = 0;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechaFin = moment(new Date()).format('YYYY-MM-DD');
    this._modoVista = 'LISTADO';
    this.pageSizeReparto = 20;
    this.codSucursal = this._loginServices.user.codSucursal;
    this.cargadorSucursal = await this.cargarSucursalById(this.codSucursal);
    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginServices.user.codSucursal;
      this.cargarSucursalPorId(this.codSucursal);
    }
    this.cargadorChofer = null;
    this.cargadorAyudante1 = null;
    this.cargadorAyudante2 = null;
    this.cargadorVehiculo = null;
    this.repartoDetalles = [];
    this.repartoDocs = [];
    //this.repartoInit();
    this.traerRepartos();
  }

  cargarSucursalPorId(codSuc) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.seleccionSucursal = codSuc;
      this.cargadorSucursal = sucursal;

    });
  }

  cambioSucursal(EVENTO) {
    this.seleccionSucursal = EVENTO;
    this.codSucursal = EVENTO;
  }
  seleccionarSucursal(item: Sucursal) {
    this.sucursal = item;
    this.cargadorSucursal = item;
  }

  async traerRepartos() {
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechaFin = moment(new Date()).format('YYYY-MM-DD');
    this._modoVista = 'LISTADO';
    this.paginaReparto = 1;
    let response = await this.FindByFecha(0, this.pageSizeReparto, null, this.chofer, this.vehiculo, this.fechaInicio, this.fechaFin);
    console.log(response);
    this.totalElementos = response.totalElements;
    this.listaReparto = response.content;
    let traerTotales = await this.sumarTotales();
  }
  async buscarReparto() {
    this.paginaReparto = 1;
    let response = await this.FindByFecha(0, this.pageSizeReparto, null, this.chofer, this.vehiculo, this.fechaInicio, this.fechaFin);
    console.log(response);
    this.totalElementos = response.totalElements;
    this.listaReparto = response.content;
    let traerTotales = await this.sumarTotales();
  }
  async cargarPagina(page: number) {
    let pagina = page - 1;
    let response = await this.FindByFecha(pagina, this.pageSizeReparto, null, this.chofer, this.vehiculo, this.fechaInicio, this.fechaFin);
    console.log(response);
    this.totalElementos = response.totalElements;
    this.listaReparto = response.content;
    let traerTotales = await this.sumarTotales();
  }
  cancelarV() {
    // this.modalVentas = 'oculto';
    this._modoVista = 'LISTADO';

  }


  cambioNumero(numero) {
    this.pageSizeReparto = numero;
  }


  async VerDocs(codReparto: number, codSucursal:number) {
    this.router.navigate(['/repartosDocs/'+codReparto+'/'+codSucursal]);
  }

  async VerRepartoPorId(code: number) {
    this.router.navigate(['/repartosView/code', code]);
  }
  async cargarRepartoDetallesPorId(code: number) {
    this.router.navigate(['/repartos/id', code]);
  }


  verReporteDetalle(reparto: Reparto) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    this._repartoServices.verReporteRepartoDetallePdf(reparto.fechaReparto, reparto.codEmpresa, reparto.codReparto).subscribe((response: any) => {
      Swal.close();
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }

  verReporteDocs(reparto: Reparto) {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...',
    });
    Swal.showLoading();
    this._repartoServices.verReporteRepartoDocsPdf(reparto.fechaReparto, reparto.codEmpresa, reparto.codReparto).subscribe((response: any) => {
      Swal.close();
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }


  // =================================================================Async===========================================================/

  async findById(cod) {
    let response = this._repartoServices.getById(cod).toPromise();
    return response;
  }

  async FindByFecha(page: number, size: number, usuario: Usuarios, chofer: Chofer, vehiculo: Vehiculo, fechainicio: any, fechafin: any) {
    let response = this._repartoServices.findByFecha(page, size, usuario, chofer, vehiculo, fechainicio, fechafin).toPromise();
    return response;
  }


  // =================================================================Seccion Selectores===========================================================/


  seleccionarVehiculo(item: Vehiculo) {
    this.vehiculo = item;
    this.cargadorVehiculo = item;
  }
  async seleccionarChofer(item: Chofer) {
    this.chofer = item;
    this.cargadorChofer = item;

  }
  async seleccionarAyudante1(item: Chofer) {
    this.ayudante1 = item;
    this.cargadorAyudante1 = item;

  }
  async seleccionarAyudante2(item: Chofer) {
    this.ayudante2 = item;
    this.cargadorAyudante2 = item;

  }


  async cargarSucursalById(cod) {
    let sucursal = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return sucursal;
  }
  advertencia(mensajes) {
    //   Swal.fire('Atención', mensajes, 'warning');
    this.toastr.warning(mensajes, 'Atención !!!', { timeOut: 2000, });
  }


  sumarTotales(): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve) => {
      this.totalGs = 0;
      this.totalkg = 0;
      for await (const reparto of  this.listaReparto) {
        this.totalGs = this.totalGs + reparto.totalGs;
        this.totalkg = this.totalkg + reparto.totalKg;
      }
      resolve(true);
    });
  }


  async traerRepartoPorId(cod) {
    let repartoModel = this._repartoServices.getById(cod).toPromise();
    return repartoModel;
  }


}
