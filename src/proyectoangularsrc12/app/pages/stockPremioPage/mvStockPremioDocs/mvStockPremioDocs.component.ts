import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { ErrModel } from "src/app/models/ErrModel.model";
import { ObjetoSelector } from "src/app/models/ObjetoSelector";
import { VentaDetalle } from "src/app/models/VentaDetalle.model";
import { CobranzaDetalle } from "src/app/models/cobranzaDetalles.model";
import { Compra } from "src/app/models/compra.model";
import { MotivoAnulacion } from "src/app/models/motivoAnulacion.model";
import { Proveedor } from "src/app/models/proveedor.model";
import { StockPremioCab } from "src/app/models/stockPremioCab.model";
import { StockPremioDetalle } from "src/app/models/stockPremioDet.model";
import { Sucursal } from "src/app/models/sucursal.model";
import { Usuarios } from "src/app/models/usuarios.model";
import { LoginService, StockPremioService, StockService, SucursalesService, UsuarioService } from "src/app/services/service.index";
import Swal from "sweetalert2";

// guardarhistorial
interface MovimientoStockPremioStorage {
  fechaInicio: string;
  fechaFin: string;
  sucursal: Sucursal;
  nroComprobante: string;
  operacion: string;
  size: number;
  page: number;
}

@Component({
  selector: 'app-list-mvstockpremio',
  templateUrl: './mvStockPremioDocs.component.html',
  styles: [``]
})
export class MvnStockPremioDocs implements OnInit {
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  operaciones: any[] = [
    { id: 'ENTRADA', descripcion: 'ENTRADA' },
    { id: 'INVENTARIO', descripcion: 'INVENTARIO' },
    { id: 'OBSEQUIO', descripcion: 'OBSEQUIO' }];

  tipo: string = ' Cliente - Comprador';
  stockPremioStorage: MovimientoStockPremioStorage = null; // guardarhistorial
  tamanhoPag: string = 'md';
  cargadorSucursal: Sucursal;
  size: number;
  fechaInicio: string;
  nroComprobante: string;
  operacion: any;
  fechafin: string;
  sucursal: Sucursal;
  sinResultado: boolean = false;
  cargando: boolean = false;
  modal = 'oculto';
  stockPremioDocs: StockPremioCab[] = [];
  stockPremioDetalle: StockPremioDetalle[] = [];
  paginador: any;
  errores: ErrModel[] = [];
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/mvstockpremiolst/page';
  codSucursal: number;
  seleccionUsuario: number;
  seleccionSucursal: number;
  rol: string;
  page: number = 0;

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

  constructor(private _stockPremioservice: StockPremioService,
    public _sucursalServices: SucursalesService,
    public _loginServices: LoginService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    public http: HttpClient
  ) { }

  async ngOnInit() {
    /*****variables */
    this.codSucursal = this._loginServices.user.codSucursal;
    this.cargando = true;
    this.size = 20;
    this.nroComprobante = '';
    this.operacion = '';
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargando = false;
    this.sinResultado = false;
    this.cargadorSucursal = await this.getSucursalbyId(this._loginServices.user.codSucursal);

    if (localStorage.getItem('stockPremioStorage')) { // guardarhistorial
      this.stockPremioStorage = JSON.parse(localStorage.getItem('stockPremioStorage'));
      this.pagina = +localStorage.getItem('page');
      this.fechaInicio = this.stockPremioStorage.fechaInicio,
        this.fechafin = this.stockPremioStorage.fechaFin,

        this.nroComprobante = this.stockPremioStorage.nroComprobante,
        this.operacion = this.stockPremioStorage.operacion,
        this.size = this.stockPremioStorage.size;
      this.page = this.pagina - 1;
      this.router.navigate([this.rutaPaginador, this.page]);
      this.loadPage(this.pagina);
    } else {
      this.router.navigate([this.rutaPaginador, this.page]);
      this.get(this.page);
    }

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, this.page]);
    this.activatedRoute.paramMap.subscribe(params => {
      this.page = +params.get('page');
      if (!this.page) {
        this.page = 0;
        this.router.navigate([this.rutaPaginador, this.page]);
      }
      this.get(this.page);
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
    this.pagina = 1;
    this.loadPage(1);
    this.page = 0;
    this.router.navigate([this.rutaPaginador, 0]);
    this.cargando = true;
    this.get(0);
  }
  cerrarModal() {
    this.modal = 'oculto';
    this.stockPremioDetalle = [];
  }
  get(page) {
    console.log(page);
    this._stockPremioservice.findByFecha(
      this.size,
      page,
      this.fechaInicio,
      this.fechafin,
      0,
      this.nroComprobante,
      this.operacion.id,
    )
      .subscribe(async (r: any) => {
        console.log(r);


        this.stockPremioDocs = await Promise.all(r.content.map(async (s: StockPremioCab) => ({
          ...s,
          sucursal: await this.getSucursalbyId(s.codSucursal)
        })));
        this.paginador = r;
        this.totalElementos = r.totalElements;
        this.cantidadElementos = r.size;
        localStorage.removeItem('stockPremioStorage'); // guardarhistorial
        localStorage.removeItem('page'); // guardarhistorial
        if (this.paginador.empty === true) {
          this.sinResultado = true;
          this.stockPremioDocs = [];
          this.cargando = false;
        } else {
          this.cargando = false;
        }
      });
  }
  verDetalle(stockPremioItem) {
    this.modal = '';
    console.log(stockPremioItem)
    this.stockPremioDetalle = stockPremioItem.detalle;
  }
  getSucursalbyId(id) {
    const response = this._sucursalServices.getSucursalbyId(id).toPromise();
    return response;
  }
  clean() {
    this.operacion = '';
    this.buscar();
  }
  cambioEstado(operacion) {
    if (operacion) {
      this.operacion = operacion.id;
    } else {
      this.operacion = '';
    }
    this.buscar();
  }

  seleccionarSucursal(item: Sucursal) {
    if (item) {
      console.log(item);
      this.cargadorSucursal = item;
      this.codSucursal = item.codSucursal;
      console.log(this.cargadorSucursal);
    } else {
      this.cargadorSucursal = null;
      this.codSucursal = 0;
    }
  }
  cambioNumero(EVENTO) {
    this.size = EVENTO;
  }

  error(err) {
    this.toastr.error(err, 'Error',
      { timeOut: 2500 });
  }



  /*   async traerPorID(cod) {
      let c = this._stockPremioDocservice.traerPorID(cod).toPromise();
      return c;
    }
    */


  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }






}
