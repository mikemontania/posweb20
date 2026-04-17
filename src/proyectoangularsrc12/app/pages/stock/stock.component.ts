import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { Producto } from '../../models/producto.model';
import { LoginService } from '../../services/login/login.service';
import { Stock } from '../../models/stock.model';
import { Deposito } from '../../models/deposito.model';
import { ExcelService, StockService } from '../../services/service.index';
import { StockReport } from '../../models/stockReport.model';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styles: []
})
export class StockComponent implements OnInit {
  cargando: boolean = false;
  mostrarBoton: boolean = false;
  tamanhoPag: string = 'md';
  stocks: Stock[] = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  cargadorProducto: Producto;
  cargadorUnidad: UnidadMedida;
  cargadorDeposito: Deposito;
  depositos: Deposito[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  codeProducto: number = 0;
  codeUnidad: number = 0;
  codeDeposito: number = 0;
  codeList: number = 0;
  seleccionDeposito: number;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/stock/page';
  constructor(private _stockService: StockService,
    private _loginServices: LoginService,
    public _excelService: ExcelService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    if (this._loginServices.user.codEmpresa == 1 && this._loginServices.user.authorities[0] == 'ROLE_ADMIN') {
      this.mostrarBoton = true;
    }
    this.cargadorDeposito = null;
    this.cargadorUnidad = null;
    this.cargadorProducto = null;
    this.busqueda = '';
    this.codeDeposito = 0;
    this.codeProducto = 0;
    this.codeUnidad = 0;
    this.cargando = true;
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.getStock(this.codeDeposito, this.codeProducto, this.codeUnidad, page);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }



  getReporteStock() {
    if (this.cargadorDeposito) {
      this._stockService.getListStock(
        this._loginServices.user.codEmpresa,
        this.cargadorDeposito.sucursal.codSucursal,
        this.cargadorDeposito.codDeposito)
        .subscribe((response: StockReport[]) => {
          if (response.length > 0) {
            console.log(response);
            this._excelService.exportAsExcelFile(response, 'xlsx');
          } else {
            this.invalido('No se puede exportar datos de la nada!!!');
          }
        });
    } else {
      this.invalido('No se ha seleccionado Deposito');
    }
  }
  getReporteStockMinimo() {
    if (this.cargadorDeposito) {
      this._stockService.getListStockMinimo(
        this._loginServices.user.codEmpresa,
        this.cargadorDeposito.sucursal.codSucursal,
        this.cargadorDeposito.codDeposito)
        .subscribe((response: StockReport[]) => {
          if (response.length > 0) {
            console.log(response);
            this._excelService.exportAsExcelFile(response, 'xlsx');
          } else {
            this.invalido('No se puede exportar datos de la nada!!!');
          }
        });
    } else {
      this.invalido('No se ha seleccionado Deposito');
    }
  }

  buscar() {

    this.router.navigate(['/stock/page', 0]);
    debounceTime(300);
    distinctUntilChanged();
    // setTimeout(() => {
    this.cargando = true;
    this.getStock(this.codeDeposito, this.codeProducto, this.codeUnidad, 0);
  }

  getStock(codDeposito, codProducto, codUnidad, page) {
    this._stockService.traerStockPorPaginas(
      this._loginServices.user.codEmpresa,
      0,
      codDeposito,
      codProducto,
      codUnidad,
      page)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.stocks = response.content as Stock[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.stocks = [];
        } else {
          this.cargando = false;
        }
      });
  }
  actualizarStock() {
    this._stockService.actualizarStock()
      .subscribe((response: any) => {
        console.log(response);
        this.getStock(this.codeDeposito, this.codeProducto, this.codeUnidad, 0);
        Swal.fire(
          'Stock actualizado!!!',
          `La base de datos se ha actualizado con exito!!!`,
          'success'
        );
      });
  }


  delete(stock) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el item ${stock.producto.nombreProducto}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._stockService.delete(stock.codStock).subscribe(
          () => {
            this.stocks = this.stocks.filter(s => s !== stock);
            Swal.fire(
              'Item Eliminado!',
              `Item  ${stock.producto.nombreProducto} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

  seleccionarProducto(item: Producto) {
    if (item) {
      console.log(item);
      this.cargadorProducto = item;
      this.codeProducto = item.codProducto;
      console.log(this.cargadorProducto);
    } else {
      this.cargadorProducto = null;
      this.codeProducto = 0;
    }
  }

  seleccionarUnidad(item: UnidadMedida) {
    if (item) {
      console.log(item);
      this.cargadorUnidad = item;
      this.codeUnidad = item.codUnidad;
      console.log(this.cargadorUnidad);
    } else {
      this.cargadorUnidad = null;
      this.codeUnidad = 0;
    }
  }


  seleccionarDeposito(item: Deposito) {
    if (item) {
      console.log(item);
      this.cargadorDeposito = item;
      this.codeDeposito = item.codDeposito;
      console.log(this.cargadorDeposito);
    } else {
      this.cargadorDeposito = null;
      this.codeDeposito = 0;
    }
  }
  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 1500 });
  }
}
