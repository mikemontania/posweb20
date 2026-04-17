import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VentasService } from '../../services/ventas/ventas.service';
import { Venta } from '../../models/venta.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { Cliente } from '../../models/cliente.model';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { MotivoAnulacionService } from '../../services/motivoAnulacion/motivoAnulacion.service';
import { User } from '../../models/user.model';
import { ExcelService, LoginService, SucursalesService, UsuarioService } from '../../services/service.index';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { StockService } from '../../services/stock/stock.service';
import { TotalModel } from '../../models/totalModel';

// guardarhistorial
interface VentasReporte {
  codigo: number,
  sucursal: string,
  anulado: string,
  estado: string,
  inicioTimbrado: string,
  finTimbrado: string,
  timbrado: string,
  nroComprobante: string,
  cliente: string,
  porcDescuento: number,
  importeDescuento: number,
  importeIva5: number,
  importeIva10: number,
  importeIvaExenta: number,
  importeNeto: number,
  importeTotal: number,
  importeSubTotal: number,
  totalKg: number,
  formaVenta: string,
  canal: string,
  modoEntrega: string,
  fechaAnulacion: Date,
  fechaCreacion: Date,
  fechaVencimiento: Date,
  fechaVenta: string,
  fechaModificacion: string,
  motivoAnulacion: string,
  esObsequio: string,
  tipoVenta: string,
}

interface VentasStorage {
  fechaInicio: string;
  fechaFin: string;
  cargadorCliente: Cliente;
  cargadorUsuario: Usuarios;
  cargadorSucursal: Sucursal;
  nroComprobante: string;
  tipoVenta: string;
  estado: string;
  size: number;
  page: number;
}

@Component({
  selector: 'app-ven',
  templateUrl: './ventasLista.component.html',
  styles: [``]
})
export class VentasListaComponent implements OnInit {
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  estados: any[] = [
    { id: 'TEMP', descripcion: 'TEMP' },
    { id: 'SYNC', descripcion: 'SYNC' },
    { id: 'WARNING', descripcion: 'WARNING' },
    { id: 'CANCEL', descripcion: 'CANCEL' },
    { id: 'ERROR', descripcion: 'ERROR' }];

  reporteVentas: VentasReporte[] = [];
  user: User;
  tipo: string = ' Cliente - Comprador';
  ventaStorage: VentasStorage = null; // guardarhistorial
  tamanhoPag: string = 'md';
  modalAnulacion: string = 'oculto';
  totalModel: TotalModel;
  cargadorUsuario: Usuarios;
  cargadorCliente: Cliente;
  cargadorSucursal: Sucursal;
  objeto ={ tipoVenta:''};
  seleccionMotivo: number;
  size: number;
  codUsuario: number;
  codVenta: number;
  fechaInicio: string;
  nroComprobante: string;
  tipoVenta: string;
  estado: string;
  fechafin: string;
  cliente: Cliente;
  usuario: Usuarios;
  sucursal: Sucursal;
  sinResultado: boolean = false;
  cargando: boolean = false;
  oculto1: string = 'oculto';
  oculto2: string = 'oculto';
  ventaAnulacion: Venta;
  detalles: VentaDetalle[] = [];
  sucursales: Sucursal[] = [];
  usuarios: Usuarios[] = [];
  cobranzaDetalles: CobranzaDetalle[] = [];
  motivosAnulacion: MotivoAnulacion[] = [];
  mAnulacion: MotivoAnulacion;
  ventas: Venta[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/ventasLista/page';
  rutaDetalles: string = '/ventasLista/id';
  codSucursal: number;
  seleccionUsuario: number;
  seleccionSucursal: number;
  rol: string;
  page: number = 0;
  totalkg: number = 0;
  totalGs: number = 0;

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
    public _loginServices: LoginService,
    public _stockServices: StockService,
    public _excelService: ExcelService,
    private _AnulacionService: MotivoAnulacionService,
    private _sucursalesServices: SucursalesService,
    private _usuariosServices: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }

  async ngOnInit() {
    this.totalkg = 0;
    this.totalGs = 0;
    /*****variables */
    this.codSucursal = this._loginServices.user.codSucursal;
    this.cargadorSucursal = await this.cargarSucursalById(this.codSucursal);
    this.cargando = true;
    this.size = 20;
    this.cargadorCliente = null;
    this.cargadorUsuario = null;
    // this.cargadorSucursal = null;
    this.nroComprobante = '';
    this.objeto.tipoVenta = '';
    this.tipoVenta = '';
    this.estado = null;
    this.codVenta = 0;
    this.rol = this._loginServices.user.authorities[0];
    console.log('rol,', this.rol);
    this.user = this._loginServices.user;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;
    /******************rol */

    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginServices.user.codSucursal;
      this.cargarSucursalPorId(this.codSucursal);
      this.cargarUsuarios(this.codSucursal);
    }
    /******************storage */
    if (localStorage.getItem('ventaStorage')) { // guardarhistorial
      this.ventaStorage = JSON.parse(localStorage.getItem('ventaStorage'));
      this.pagina = +localStorage.getItem('page');
      this.fechaInicio = this.ventaStorage.fechaInicio,
        this.fechafin = this.ventaStorage.fechaFin,
        this.cargadorCliente = this.ventaStorage.cargadorCliente,
        this.cargadorUsuario = this.ventaStorage.cargadorUsuario,
        this.cargadorSucursal = this.ventaStorage.cargadorSucursal,
        this.nroComprobante = this.ventaStorage.nroComprobante,
        this.tipoVenta = this.ventaStorage.tipoVenta,
        this.estado = this.ventaStorage.estado,
        this.size = this.ventaStorage.size;
      this.page = this.pagina - 1;
      this.router.navigate([this.rutaPaginador, this.page]);
      this.loadPage(this.pagina);
    } else {
      this.router.navigate([this.rutaPaginador, this.page]);
      this.traerVentas(this.page);
    }

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, this.page]);
    this.activatedRoute.paramMap.subscribe(params => {
      this.page = +params.get('page');
      if (!this.page) {
        this.page = 0;
        this.router.navigate([this.rutaPaginador, this.page]);
      }
      this.traerVentas(this.page);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }
  buscarVenta() {
    this.pagina = 1;
    this.loadPage(1);
    this.page = 0;
    this.router.navigate([this.rutaPaginador, 0]);
    /*    debounceTime(300);
       distinctUntilChanged(); */
    this.cargando = true;
    this.traerVentas(0);
  }

  traerVentas(page) {


    console.log('TIPOVENTA');
    console.log(this.tipoVenta);
    console.log(page);

    this._ventasService.findByFecha(
      page,
      this.fechaInicio,
      this.fechafin,
      this.cargadorCliente,
      this.cargadorUsuario,
      this.cargadorSucursal,
      this.nroComprobante,
      this.tipoVenta,
      this.estado,
      this.size,
      null
    )
      .subscribe(async (r: any) => {
        console.log(r.content);
        this.ventas = r.content as Venta[];
        this.paginador = r;
        this.totalElementos = r.totalElements;
        this.cantidadElementos = r.size;
        localStorage.removeItem('ventaStorage'); // guardarhistorial
        localStorage.removeItem('page'); // guardarhistorial
        this.totalModel = await this.findTotal();
        this.totalkg = this.totalModel.totalKg;
        this.totalGs = this.totalModel.totalGs;
        if (this.paginador.empty === true) {
          this.sinResultado = true;
          this.ventas = [];
          this.cargando = false;
        } else {
          this.cargando = false;

        }
      });
  }

  verTodos() {
    this.cargadorCliente = null;
    this.cargadorUsuario = null;
    this.cargadorSucursal = null;
    this.estado = null;
    this.fechaInicio = moment('2019-01-01').format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.traerVentas(0);
  }

  Cambiotipo(event){
    console.log(event)
     this.tipoVenta = event;
  }

  export(): void {


    this._ventasService.listaVentas(
      this.fechaInicio,
      this.fechafin,
      this.cargadorCliente,
      this.cargadorUsuario,
      this.cargadorSucursal,
      this.nroComprobante,
      this.tipoVenta,
      this.estado,
      null
    )
      .subscribe(async (ventas: Venta[]) => {
        console.log(ventas);
        if (ventas.length > 0) {
          for await (const v of ventas) {
            let item: VentasReporte = {
              codigo: v.codVenta,
              sucursal: v.codSucursalErp,
              anulado: (v.anulado) ? 'SI' : 'NO',
              estado: v.estado,
              inicioTimbrado: v.inicioTimbrado,
              finTimbrado: v.finTimbrado,
              timbrado: v.timbrado,
              nroComprobante: v.nroComprobante,
              cliente: v.cliente.concatDocNombre,
              formaVenta: v.formaVenta.descripcion,
              importeDescuento: v.importeDescuento,
              importeIva5: v.importeIva5,
              importeIva10: v.importeIva10,
              importeIvaExenta: v.importeIvaExenta,
              importeNeto: v.importeNeto,
              importeTotal: v.importeTotal,
              importeSubTotal: v.subTotal,
              totalKg: v.totalKg,
              modoEntrega: v.modoEntrega,
              canal:v?.canal?.descripcion || '' ,
              fechaAnulacion: v.fechaAnulacion,
              fechaCreacion: v.fechaCreacion,
              fechaVencimiento: v.fechaVencimiento,
              fechaVenta: v.fechaVenta,
              fechaModificacion: v.fechaModificacion,
              porcDescuento: v.porcDescuento,
              motivoAnulacion: (v.motivoAnulacion) ? v.motivoAnulacion.descripcion : 'xxxxxxxx',
              esObsequio: (v.esObsequio) ? 'SI' : 'NO',
              tipoVenta: v.tipoVenta,
            }
            this.reporteVentas.push(item)
          }

          this._excelService.exportAsExcelFile(this.reporteVentas, 'xlsx');
        } else {
          this.invalido('No se puede exportar datos de la nada!!!');
        }

      });

  }

  clean() {
    this.estado = '';
    this.buscarVenta();
  }
  cambioEstado(estado) {
    if (estado) {
      this.estado = estado.id;
    } else {
      this.estado = '';
    }
    this.buscarVenta();
  }
  mostrarModalVentas(id) {
    this._ventasService.traerVentaPorID(id)
      .subscribe((vent: any) => {
        console.log(vent.venta);
        console.log(id);
        if (vent.venta) {
          console.log('abrir modal');
          this.detalles = vent.venta.detalle;
        }
      });
  }
  mostrarModalcobranza(id) {
    this._ventasService.traerVentaPorID(id)
      .subscribe((res: any) => {
        console.log(res.venta.cobranza);
        if (res.venta.cobranza) {
          console.log('abrir modal');
          this.cobranzaDetalles = res.venta.cobranza.detalle;
        }
      });
  }
  verTicket(venta: Venta) {
    this._ventasService.traercomprobante(venta).subscribe((response: any) => {
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }

  definirComprobante(venta: Venta) {
    if (venta.tipoComprobante == 'FACTURA') {
      this.verTicketPdf(venta.codVenta);
    } else {
      this.router.navigate(['/ticketVenta/id/', venta.codVenta]);
    }
  }

  verTicketPdf(venta: number) {
    this._ventasService.verTicketPdf(venta, this.tipo).subscribe((response: any) => {
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    });
  }

  cambioNumero(EVENTO) {
    this.size = EVENTO;
  }




  seleccionarUsuario(item: Usuarios) {
    this.usuario = item;
    this.cargadorUsuario = item;
  }

  seleccionarCliente(item: Cliente) {
    this.cliente = item;
    this.cargadorCliente = item;
  }
  seleccionarSucursal(item: Sucursal) {
    this.sucursal = item;
    this.cargadorSucursal = item;
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }



  async enviarAnulacion() {
    if (!this.mAnulacion) {
      this.invalido('Debe seleccionar motivo de anulación');
      return;
    }

    let reembolsar = await this.reembolsarStock(this.ventaAnulacion);
    console.log(reembolsar)
    let anular = await this.anularVenta(this.codVenta, this.mAnulacion);
    console.log(anular)
    this.codVenta = 0;
    this.modalAnulacion = 'oculto';
    swal.fire('Venta anulada ', 'Venta anulada con exito', 'success');
    this.traerVentas(0);
    this.totalModel = await this.findTotal();
    this.totalkg = this.totalModel.totalKg;
    this.totalGs = this.totalModel.totalGs;
    this.seleccionMotivo = 0;

  }

  async cargarSucursalById(cod) {
    let sucursal = this._sucursalesServices.getSucursalbyId(cod).toPromise();
    return sucursal;
  }
  async traerVentaPorID(cod) {
    let venta = this._ventasService.traerVentaPorID(cod).toPromise();
    return venta;
  }
  async reembolsarStock(venta: Venta) {
    console.log(venta);
    let res = this._stockServices.reembolsarStockExistencia(venta.deposito.codDeposito, venta.detalle)
      .toPromise();
    return res;
  }

  async anularVenta(codVenta, mAnulacion) {
    let res = this._ventasService.anularVenta(codVenta, mAnulacion)
      .toPromise();
    return res;

  }

  async traerMotrivosAnul() {
    let res = this._AnulacionService.traerByCodEmp(this.user.codEmpresa)
      .toPromise();
    return res;
  }
  async mostrarModalAnulacion(cod) {
    this.codVenta = cod;
    let respo = await this.traerVentaPorID(cod);
    this.ventaAnulacion = respo.venta;
    this.motivosAnulacion = await this.traerMotrivosAnul();
    this.modalAnulacion = '';
    console.log(this.motivosAnulacion);
  }
  cerrarModalAnulacion() {
    this.ventaAnulacion = null;
    this.modalAnulacion = 'oculto';
    this.seleccionMotivo = 0;
    this.mAnulacion = null;
  }


  cambioTerminal(event) {
    for (let indice = 0; indice < this.motivosAnulacion.length; indice++) {           // tslint:disable-next-line:triple-equals
      if (this.motivosAnulacion[indice].codMotivoAnulacion == this.seleccionMotivo) {
        this.mAnulacion = this.motivosAnulacion[indice];
      }
    }
  }


  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
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
  cambioUsuario(id) {
    this._usuariosServices.getUsuario(id).subscribe(cargadorUsuario => {
      this.cargadorUsuario = cargadorUsuario;
    });
  }

  editar(param) {// guardarhistorial
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
      }
      localStorage.setItem('page', JSON.stringify(page + 1));
      console.log('page', page);
    });
    this.ventaStorage = {
      page: 0,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechafin,
      cargadorCliente: this.cargadorCliente,
      cargadorUsuario: this.cargadorUsuario,
      cargadorSucursal: this.cargadorSucursal,
      nroComprobante: this.nroComprobante,
      tipoVenta: this.tipoVenta,
      estado: this.estado,
      size: this.size
    };
    localStorage.setItem('ventaStorage', JSON.stringify(this.ventaStorage));
    this.router.navigate([this.rutaDetalles, param]);
  }


  cargarSucursalPorId(codSuc) {
    this._sucursalesServices.getSucursalbyId(codSuc).subscribe(sucursal => {
      this.sucursales.push(sucursal);
      this.seleccionSucursal = codSuc;
      this.cargadorSucursal = sucursal;

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
    });
  }

  async traerModeloPorId(cod) {
    let response = this._ventasService.traerVentaPorID(cod).toPromise();
    return response;
  }

  findTotal() {
    let response = this._ventasService.findTotal(
      this.fechaInicio,
      this.fechafin,
      this.cargadorCliente,
      this.cargadorUsuario,
      this.cargadorSucursal,
      this.nroComprobante,
      this.tipoVenta,
      this.estado
    ).toPromise();
    return response;
  }

  // calcularTotalKgV(ventaDetalle: VentaDetalle[]): Promise<boolean> {
  //   return new Promise<boolean>(async (resolve) => {
  //     for await (const detalle of ventaDetalle) {
  //       this.totalGs = this.totalGs + detalle.importeTotal;
  //       this.totalkg = this.totalkg + detalle.producto.peso;
  //     }
  //     resolve(true);
  //   });
  // }
  // sumarTotales(): Promise<Boolean> {
  //   return new Promise<Boolean>(async (resolve) => {
  //     this.totalGs = 0;
  //     this.totalkg = 0;
  //     for await (const venta of this.ventas) {
  //       if (venta.anulado == false || venta.esObsequio == false) {
  //         let respo = await this.traerModeloPorId(venta.codVenta);
  //         let calculartotales = await this.calcularTotalKgV(respo.venta.detalle);
  //       }
  //     }
  //     resolve(true);
  //   });
  // }

}
