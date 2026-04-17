import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VentasService } from '../../services/ventas/ventas.service';
import { Venta } from '../../models/venta.model';
import { Detalles } from '../../models/detalles.model';
import { VentaDetalle } from '../../models/VentaDetalle.model';
import { CobranzaDetalle } from '../../models/cobranzaDetalles.model';
import { ToastrService } from 'ngx-toastr';
import { ErrModel } from '../../models/ErrModel.model';
import { Usuarios } from '../../models/usuarios.model';
import { Sucursal } from '../../models/sucursal.model';
import { LoginService, ExcelService } from '../../services/service.index';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { ObjetoSelector } from '../../models/ObjetoSelector';
import { MedioPago } from '../../models/medioPago.model';
import { CobranzaResumen } from '../../models/cobranzaResumen.model';
import { ResumenMedioPago } from '../../models/resumenMedioPago';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { EmpresasService } from '../../services/empresas/empresas.service';
import { Empresas } from '../../models/empresas.model';
import * as jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BASE_URL } from '../../config/config';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-ven',
  templateUrl: './cobranzaLista.component.html',
  styles: [``]
})
export class CobranzaListaComponent implements OnInit {
  @ViewChild('contenido') contenido: ElementRef;
  fileName: string = 'mediopago.xlsx';
  data: any;
  img: any;
  imagenEmpresa: string = './assets/images/grupocavallaro.png';
  tamanhoPag: string = 'md';
  cargadorUsuario: Usuarios;
  public rol: string;
  cajero: boolean;
  public resumenMedioPago: ResumenMedioPago[] = [];
  public sucursales: Sucursal[] = [];
  cargadorMedioPago: MedioPago;
  cargadorSucursal: Sucursal;
  empresa: Empresas;
  size: number;
  codUsuario: number;
  sumaCantidad: number;
  sumaToTal: number;
  codVenta: number;
  codSucursal: number;
  fechaInicio: string;
  fechafin: string;
  medioPago: MedioPago;
  codMedioPago: number;
  usuario: Usuarios;
  sucursal: Sucursal;
  cargando: boolean = false;
  mostrar: boolean = false;
  oculto1: string = 'oculto';
  oculto2: string = 'oculto';
  detalles: VentaDetalle[] = [];
  cobranzaDetalles: CobranzaDetalle[] = [];
  motivosAnulacion: MotivoAnulacion[] = [];
  mAnulacion: MotivoAnulacion;
  cobranzaResumen: CobranzaResumen[] = [];
  paginador: any;
  columnas: string[];
  filas: any[] = []
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0; rutaPaginador: string = '/cobranzaLista/page';
  public numeros: ObjetoSelector[] = [
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 15, descripcion: '15', enum: '15' },
    { cod: 20, descripcion: '20', enum: '20' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 40, descripcion: '40', enum: '40' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 100, descripcion: '100', enum: '100' },
    { cod: 200, descripcion: '200', enum: '200' },
    { cod: 300, descripcion: '300', enum: '300' },
    { cod: 400, descripcion: '400', enum: '400' },
    { cod: 500, descripcion: '500', enum: '500' },
    { cod: 600, descripcion: '600', enum: '600' },
  ];


  constructor(private _ventasService: VentasService,
    public _loginService: LoginService,
    public _excelService: ExcelService,
    private _sucursalesServices: SucursalesService,
    private _usuarioServices: UsuarioService,
    private _empresasService: EmpresasService,
    private _dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient,
    private _sanitizer: DomSanitizer
  ) {


  }

  ngOnInit() {
    this._empresasService.traerEmpresasPorId(this._loginService.user.codEmpresa).subscribe((resp: any) => {
      this.empresa = resp;
      // this.traerImagen(this.empresa.img, 'empresas');
    });
    this.size = 20;
    this.cargadorMedioPago = null;
    this.cargadorUsuario = null;
    this.codMedioPago = 0;
    this.codSucursal = 0;
    this.codUsuario = 0;
    this.cargadorSucursal = null;
    this.rol = this._loginService.user.authorities[0];
    console.log('rol,', this.rol);
    if (this.rol == 'ROLE_CAJERO') {
      this.cajero = true;
      this.cargarSucursalPorId();
    } else {
      this.cajero = false;
      this.cargarSucursales();
    }
    this.codVenta = 0;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;


    this.traerDatos(0);

    this.router.navigate([this.rutaPaginador, 0]);

    /*==========Observa la paginación =======================*/
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }

      this.traerDatos(page);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscar() {

    this.router.navigate([this.rutaPaginador, 0]);
    debounceTime(300);
    distinctUntilChanged();

    this.cargando = true;
    this.traerDatos(0);
  }

  traerDatos(page) {
    this.cargando = true;
    if (!this.fechaInicio) {
      this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    }
    if (!this.fechafin) {
      this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    }

    if (this.rol == 'ROLE_CAJERO') {
      this.codSucursal = this._loginService.user.codSucursal;
    }

    this._ventasService.traerDetalleCobranza(
      page,
      this.fechaInicio,
      this.fechafin,
      this.codMedioPago,
      this.codUsuario,
      this.codSucursal,
      this.size
      ).subscribe((respuesta: any) => {
      this.traerTotales(this.fechaInicio, this.fechafin, this.codUsuario, this.codSucursal);
      console.log('respuesta', respuesta);
      this.cobranzaResumen = respuesta.content as CobranzaResumen[];
      this.paginador = respuesta;
      this.totalElementos = respuesta.totalElements;
      this.cantidadElementos = respuesta.size;
      if (this.paginador.empty === true) {
        this.cobranzaResumen = [];
        this.cargando = false;
      } else {
        this.mostrar = true;
        this.cargando = false;

      }
    });
  }

  export(): void {
    this._ventasService.reporteDetalleCobranza(
      this.fechaInicio,
      this.fechafin,
      this.codMedioPago,
      this.codUsuario,
      this.codSucursal
          ).subscribe((cobranzaResumen: CobranzaResumen[]) => {
      console.log('cobranzaResumen', cobranzaResumen);
      if (cobranzaResumen.length > 0) {
         this._excelService.exportAsExcelFile(cobranzaResumen, 'xlsx');
      } else {
        this.invalido('No se puede exportar datos de la nada!!!');
      }
    });
  }

  traerTotales(fechaInicio, fechaFin, codUsuario, codsucursal) {

    this._dashboardService.getResumenMediopago(fechaInicio, fechaFin, codUsuario, codsucursal).subscribe((respuesta: any) => {
      if (respuesta) {
        this.resumenMedioPago = respuesta as ResumenMedioPago[];
        this.sumaCantidad = 0;
        this.sumaToTal = 0;
        if (this.resumenMedioPago.length > 0) {
          for (let index = 0; index < this.resumenMedioPago.length; index++) {
            this.sumaToTal = this.sumaToTal + this.resumenMedioPago[index].importeCobrado;
            this.sumaCantidad = this.sumaCantidad + this.resumenMedioPago[index].cantCobranzas;
          }

        }
      } else {
        this.resumenMedioPago = [];
        console.error('NO SE RECIBIO RESUMEN MEDIO PAGO')
      }
    });
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
  /*   verTicket(venta: Venta) {
      this._ventasService.traercomprobante(venta).subscribe((response: any) => {
        const fileURL = URL.createObjectURL(response);
        window.open(fileURL, '_blank');
      });
    }
   */

  async traerImgEmpresa(imagen) {
    let img = this._empresasService.getImagen(imagen).toPromise();
    return img;
  }

  async Traerbase64(blob): Promise<any> {

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        var base64data = reader.result;
        console.log('dataURL', base64data)
        resolve(base64data);
      }
    });
  }



  async descargar() {
    let doc = new jsPDF('p', 'pt', 'a4', true);
    let imagenResponse = await this.traerImgEmpresa(this.empresa.img);
    let imageData = await this.Traerbase64(imagenResponse);

    // formato de moneda
    const formatter = new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    })

    let fInicio = moment(this.fechaInicio).format('DD/MM/YYYY');
    let fFin = moment(this.fechafin).format('DD/MM/YYYY');

    // titulos
    doc.setFontType('bold');
    doc.setFontSize(16);
    doc.text(40, 60, 'Empresa: ');
    doc.text(40, 78, 'Ruc: ');
    doc.text(40, 96, 'Desde: ');
    doc.text(40, 114, 'Hasta: ');
    doc.text(220, 139, 'Reporte de medio pago');
    // datos

    doc.setFontSize(12);
    doc.setFontType('normal');
    doc.text(120, 60, this.empresa.razonSocial);
    doc.text(80, 78, this.empresa.ruc);
    doc.text(95, 96, fInicio);
    doc.text(95, 114, fFin);

    doc.addImage(imageData, 'JPG', 490, 40, 60, 60);

    let detalles = [];

    this.resumenMedioPago.forEach(element => {
      let importeCobrado = formatter.format(element.importeCobrado);
      // "Gs. 10.000"
      let temp = [element.medioPago, element.cantCobranzas, importeCobrado];
      detalles.push(temp);
    });
    let total = formatter.format(this.sumaToTal)
    let cabecera = [['Medio pago', 'Cantidad', 'I. Cobrado']];
    let foot = [['Totales', this.sumaCantidad, total]];

    doc.autoTable({
      startY: null,
      margin: { top: 150, botton: 10 },
      head: cabecera,
      body: detalles,
      foot: foot,
      theme: 'grid',
      headStyles: {
        halign: 'center',
        valign: 'middle',

      },
      bodyStyles: {
        halign: 'center',
        valign: 'middle',
      },

      footStyles: {
        halign: 'center',
        valign: 'middle',
      },
    });
    // doc.addPage(); me crea una pagina en blanco al final :(
    doc.save('descarga.pdf');
  }


  cambioNumero(EVENTO) {
    this.size = EVENTO;
  }

  seleccionarUsuario(item: Usuarios) {
    if (item) {
      this.usuario = item;
      this.cargadorUsuario = item;
      this.codUsuario = item.codUsuario;
    } else {
      this.codUsuario = 0;
    }
  }

  seleccionarMedioPago(item: MedioPago) {
    if (item) {
      this.medioPago = item;
      this.cargadorMedioPago = item;
      this.codMedioPago = item.codMedioPago;
    } else {
      this.codMedioPago = 0;
    }
  }
  seleccionarSucursal(item: Sucursal) {
    if (item) {
      this.sucursal = item;
      this.cargadorSucursal = item;
      this.codSucursal = item.codSucursal;
    } else {
      this.codSucursal = 0;
    }
  }
  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }



  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }

  cargarSucursales() {
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(suc => {
      this.sucursales = suc;
    });
  }

  cargarSucursalPorId() {
    this._sucursalesServices.getSucursalbyId(this._loginService.user.codSucursal).subscribe((sucursal: Sucursal) => {
      this.sucursales.push(sucursal);
      this.cargadorSucursal = sucursal;
    });
  }


  selectedItem(item) {
    if (item) {
      this.cargadorSucursal = item;
      this.codSucursal = this.cargadorSucursal.codSucursal;
    }else{
      if (!this.cargadorSucursal) {
        console.log('se esta limpiando = null'+this.cargadorSucursal);
        this.codSucursal = 0;
      }
    }
  }


}
