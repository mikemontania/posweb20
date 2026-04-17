import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { PrecioService } from '../../services/precio/precio.service';
import { Precio } from '../../models/precio.model';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
import { User } from '../../models/user.model';
import { Producto } from '../../models/producto.model';
import { LoginService } from '../../services/login/login.service';
@Component({
  selector: 'app-precios',
  templateUrl: './precios.component.html',
  styles: []
})
export class PreciosComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  precios: Precio[] = [];
  cargadorProducto: Producto;
  listaPrecio: ListaPrecio[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  codeProd: number = 0;
  codeList: number = 0;
  seleccionListaPrecio: number;
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/precios/page';
  user: User;
  constructor(private _preciosService: PrecioService,
    private _loginServices: LoginService,
    private _listaPrecioService: ListaPrecioService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.user = this._loginServices.user;
    this.busqueda = '';
    this.codeProd = 0;
    this.codeList = 0;
    this.cargarListaPrecio();
    this.cargando = true;
    this.cargadorProducto = null;
    this.seleccionListaPrecio = 0;
    this.cargarListaPrecio();
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.traerPrecios(page, this.busqueda, this.codeProd, this.codeList);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscarPrecios() {

    this.router.navigate(['/precios/page', 0]);
    debounceTime(300);
    distinctUntilChanged();
    if (this.codeList > 0 && this.codeProd > 0) {
      this.busqueda = 'LISTAPRECIO&PRODUCTO'
    } else if (this.codeList > 0 && this.codeProd === 0) {
      this.busqueda = 'LISTAPRECIO'
    } else if (this.codeList === 0 && this.codeProd > 0) {
      this.busqueda = 'PRODUCTO'
    } else if (this.codeList === 0 && this.codeProd === 0) {
      this.busqueda = ''
      this.ngOnInit();
      return;
    }
    // setTimeout(() => {
    this.cargando = true;
    this.traerPrecios(0, this.busqueda, this.codeProd, this.codeList);
  }

  traerPrecios(page, termino, codeProd, codeList) {
    this._preciosService.traerPreciosPorPaginasComponente(page, termino, codeProd, codeList)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.precios = response.content as Precio[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.precios = [];
        } else {
          this.cargando = false;
        }
      });
  }

  deletePrecios(precio) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el Precios ${precio.descripcion}?`,
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
        this._preciosService.deletePrecio(precio.codPRecio).subscribe(
          () => {
            this.precios = this.precios.filter(prec => prec !== precio);
            Swal.fire(
              'Precios Eliminado!',
              `Precios ${precio.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
  cargarListaPrecio() {
    this._listaPrecioService.traerListaPrecio(this._loginServices.user.codEmpresa).subscribe(listaPrecio => {
      this.listaPrecio = listaPrecio;
      this.listaPrecio.push({
        codListaPrecio: 0,
        codListaPrecioErp: '00',
        descripcion: 'TODOS',
        codEmpresa: this._loginServices.user.codEmpresa,
        ecommerce: false,
        esAdmin: false
      });
    });
  }
  cambioListaPrecio(event) {
    this.codeList = this.seleccionListaPrecio;
  }


  seleccionarProducto(item: Producto) {
    console.log(item);
    if (item) {
      this.cargadorProducto = item;
      this.codeProd = item.codProducto;
    } else {
      this.codeProd = 0;
      this.cargadorProducto = null;
    }
    // $('#typeahead-productos').val(item.codProducto);
    //  this.descuento.producto = item;
    /*   this.nombreProducto =item.nombreProducto; */
    console.log(this.cargadorProducto);
  }



  delete(precio: Precio) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el precio ?`,
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
        this._preciosService.deletePrecio(precio.codPrecio).subscribe(
          () => {
            this.precios = this.precios.filter(pre => pre !== precio);
            Swal.fire(
              'Precio Eliminado!',
              `Precio se elimino con éxito.`,
              'success'
            );
            this.ngOnInit();
          }
        );

      }
    });
  }

}
