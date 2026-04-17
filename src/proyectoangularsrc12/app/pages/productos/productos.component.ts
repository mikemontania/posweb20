import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: []
})
export class ProductosComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando2: boolean = true;
  cargando: boolean = false;
  productos: Producto[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/productos/page';
  constructor(private _productosService: ProductoService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.cargando = false;
    this.cargando2 = true;
    this.busqueda = '';
    this.traerProductos(0, this.busqueda);

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }

      this.traerProductos(page, this.busqueda);
    });
    /*=====================================================*/
  }



  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }




  buscarProductos(termino: string) {

    this.router.navigate(['/productos/page', 0]);
    debounceTime(300);
    distinctUntilChanged();
    if (termino.length <= 2) {
      this.busqueda = '';
      this.ngOnInit();
      return;
    }
    // setTimeout(() => {
    this.cargando = true;
    this.busqueda = termino.toUpperCase();
    this.traerProductos(0, termino.toUpperCase());
  }

  traerProductos(page, termino) {
    // this.cargando = true;
    this._productosService.traerProductosPorPaginasComponente(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response);
        console.log(response.content);
        this.productos = response.content as Producto[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.productos = [];
        } else {
          /*  this.cargando = true;
           setTimeout(() => {
             console.log('hide');
             this.cargando = false;
           }, 2000); */
          this.cargando = false;
        }
      });
  }

  delete(producto) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el Producto ${producto.descripcion}?`,
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
        this._productosService.deleteProducto(producto.codProducto).subscribe(
          () => {
            this.productos = this.productos.filter(pro => pro !== producto);
            Swal.fire(
              'Productos Eliminado!',
              `Productos ${producto.descripcion} eliminado con éxito.`,
              'success'
            );
            this.cargando = false;
            this.cargando2 = true;
            this.busqueda = '';
            this.traerProductos(0, this.busqueda);
          }
        );

      }
    });
  }




}
