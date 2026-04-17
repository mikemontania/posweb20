import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login/login.service';
import { ExcelService, StockPremioService, SucursalesService } from '../../services/service.index';
import { StockPremio } from 'src/app/models/stockPremio.model';
import { Premio } from 'src/app/models/premio.model ';
import { Sucursal } from 'src/app/models/sucursal.model';

@Component({
  selector: 'app-stockPremio',
  templateUrl: './stockPremio.component.html',
  styles: []
})
export class StockPremioComponent implements OnInit {
  cargando: boolean = false;
  mostrarBoton: boolean = false;
  tamanhoPag: string = 'md';
  stockPremios: StockPremio[] = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  cargadorSucursal: Sucursal;
  cargadorPremio: Premio;
  nuevoPremio: Premio;
  paginador: any;
  paginas = [];
  busqueda: string = '';
  codeSucursal: number = 0;
  codePremio: number = 0;
  codeList: number = 0;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/stockPremio/page';
  role: string = this._loginServices.user.authorities[0];
  stockAdd: string = 'oculto';
  stockModif: string = 'oculto';
  ajusteStock: StockPremio = new StockPremio();
  constructor(private _stockPremioService: StockPremioService,
    private _sucursalServices: SucursalesService,
    private _loginServices: LoginService,
    public _excelService: ExcelService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {

  }

  async ngOnInit() {
    this.role = this._loginServices.user.authorities[0];
    console.log(this.role)
    if (this._loginServices.user.codEmpresa == 1 && this.role == 'ROLE_ADMIN') {
      this.mostrarBoton = true;
    } else {
      this.cargadorSucursal = await this._sucursalServices.getSucursalbyId(this._loginServices.user.codSucursal).toPromise();;
      this.codeSucursal = this._loginServices.user.codSucursal;
    }
    this.cargadorPremio = null;
    this.busqueda = '';
    this.codePremio = 0;
    this.cargando = true;
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.getStock(this.codeSucursal, this.codePremio, page);
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

    this.router.navigate(['/stockPremio/page', 0]);
    debounceTime(300);
    distinctUntilChanged();
    // setTimeout(() => {
    this.cargando = true;
    this.getStock(this.codeSucursal, this.codePremio, 0);
  }

  getStock(codSucursal, codPremio, page) {
    this._stockPremioService.traerStockPorPaginas(
      this._loginServices.user.codEmpresa,
      codSucursal,
      codPremio,
      page)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe(async (response: any) => {
        if (response.content) {
          console.log('stockPremios');
          this.stockPremios = await Promise.all(response.content.map(async (s: StockPremio) => ({
            ...s,
            sucursal: await this.getSucursalById(s.codSucursal)
          }))); console.log(this.stockPremios);
        } else {
          this.stockPremios = [];
        }

        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.stockPremios = [];
        } else {
          this.cargando = false;
        }
      });
  }


  darEntrada(item: StockPremio) {
    this.ajusteStock = item;
    this.stockModif = '';
  }

  cerrarModalEntrada() {
    this.stockModif = 'oculto';
    this.ajusteStock = new StockPremio();
  }

  seleccionarPremio(item: Premio) {
    if (item) {
      console.log(item);
      this.cargadorPremio = item;
      this.codePremio = item.codPremio;
      console.log(this.cargadorPremio);
    } else {
      this.cargadorPremio = null;
      this.codePremio = 0;
    }
  }

  seleccionarNuevoPremio(item: Premio) {
    if (item) {
      console.log(item);
      this.nuevoPremio = item;
      this.codePremio = item.codPremio;
      console.log(this.nuevoPremio);
    } else {
      this.nuevoPremio = null;
      this.codePremio = 0;
    }
  }

  modalAgregarStock() {
    this.stockAdd = '';
  }


  iniciarStock() {
    if (this.nuevoPremio) {
      this.stockAdd = '';
      this._stockPremioService.iniciarstock(this._loginServices.user.codEmpresa, this.nuevoPremio.codPremio)
        .subscribe(
          respuesta => {
            this.getStock(this.codeSucursal, 0, 0);
            Swal.fire('Inicialización completada', `Se ha inicializado el stock del premio ${this.nuevoPremio.descripcion} `, 'success');
            this.cancelarInicio();
          },
          err => {
            console.error('Código del error desde el backend: ' + err.status);
          }
        );
    } else {
      Swal.fire('Atención', 'Premio es oblicatorio para la inicialización', 'error');
      this.cancelarInicio();
    }
  }

  ajustarstock() {
    if (this.ajusteStock) {
      this._stockPremioService.ajustarstock(this.ajusteStock.codStockPremio, this.ajusteStock.comprometido)
        .subscribe(
          respuesta => {
            this.getStock(this.codeSucursal, 0, 0);
            Swal.fire('Stock Ajustado', `Se ha ajustado el stock del premio ${this.ajusteStock.premio.descripcion} `, 'success');
            this.cerrarModalEntrada();
          },
          err => {
            console.error('Código del error desde el backend: ' + err.status);
          }
        );
    } else {
      Swal.fire('Atención', 'Premio es oblicatorio para la inicialización', 'error');
      this.cancelarInicio();
    }
  }

  cancelarInicio() {
    this.stockAdd = 'oculto';
    this.nuevoPremio = null;
  }


  async getSucursalById(id) {
    let sucursal: Sucursal = await this._sucursalServices.getSucursalbyId(id).toPromise();
    return sucursal;
  }


  seleccionarSucursal(item: Sucursal) {
    if (item) {
      console.log(item);
      this.cargadorSucursal = item;
      this.codeSucursal = item.codSucursal;
      console.log(this.cargadorSucursal);
    } else {
      this.cargadorSucursal = null;
      this.codeSucursal = 0;
    }
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
}
