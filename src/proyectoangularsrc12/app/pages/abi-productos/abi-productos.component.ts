import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ABI_Producto } from 'src/app/models/abi-producto.model'; 
import { AbiProductoService, ExcelService  } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';
import { AbiOrdenService } from '../../services/abi-orden/abi-orden.service';
interface ExcelProductos {
  id: number;
  api_extra_data: string;
  descripcion: string;
  categoria: number;
  nombre: string;
  descripcion_extensa: string;
  etiquetas: string;
  cantidad_mayorista: number;
  precio: number;
  precio_mayorista: number;
  cantidad_disponible: number;
 
}
@Component({
  selector: 'app-abi-productos',
  templateUrl: './abi-productos.component.html',
  styles: []
})
export class AbiProductosComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando2: boolean = true;
  cargando: boolean = false;
  productos: ABI_Producto[] = [];
  reporte: ExcelProductos[]= [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/abi-productos/page';
  constructor(
    private _productosAbiService: AbiProductoService,
    private _abiOrdenServices: AbiOrdenService,
    public _excelService: ExcelService,
    private toastr: ToastrService,
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

    this.router.navigate([this.rutaPaginador, 0]);
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
    let size =20;
    this._productosAbiService.getProductosPorPaginas(page+1,size,termino)
      .subscribe((response: any) => {
        console.log(response);
        this.productos = response.results as ABI_Producto[];
        console.log( this.productos);
        this.paginador = response;
      this.totalElementos = response.count;
      this.cantidadElementos = size;
      //  this.cantidadElementos = response.size;
       // this.totalElementos = response.totalElements;
       // this.totalElementos = response.totalElements;
        //this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.productos = [];
        } else {
            this.cargando = true;
           setTimeout(() => {
             console.log('hide');
             this.cargando = false;
           }, 2000);  
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
      confirmButtonClass: 'btn btn-outline-success ml-1',
      cancelButtonClass: 'btn btn-outline-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        // this._productosService.deleteProducto(producto.codProducto).subscribe(
        //   () => {
        //     this.productos = this.productos.filter(pro => pro !== producto);
        //     Swal.fire(
        //       'Productos Eliminado!',
        //       `Productos ${producto.descripcion} eliminado con éxito.`,
        //       'success'
        //     );
        //     this.cargando = false;
        //     this.cargando2 = true;
        //     this.busqueda = '';
        //     this.traerProductos(0, this.busqueda);
        //   }
 
  

      }
    });
  }


  async getProductos() {
    let productos = this._abiOrdenServices.getProductos().toPromise();
    return productos;
  }

  async getProductoById(id) {
    let producto = this._productosAbiService.getProducto(id).toPromise();
    return producto;
  }


  async export(): Promise<void> {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();
    this.reporte = [];
    let productos: ABI_Producto[] = await this.getProductos();
     if (productos.length > 0) {
      for await (const p of productos) {
        console.log(p);
        let producto = await this.getProductoById(p.id);
        let item: ExcelProductos = {
          id:producto.id,
          api_extra_data: producto.api_extra_data,
          descripcion: producto.descripcion,
          categoria:producto.categoria,
          nombre: producto.nombre,
          descripcion_extensa: producto.descripcion_extensa,
          etiquetas: producto.etiquetas,
          cantidad_mayorista:producto.cantidad_mayorista,
          precio: producto.precio,
          precio_mayorista: producto.precio_mayorista,
          cantidad_disponible: producto.cantidad_disponible
        }
        this.reporte.push(item)
      }
      this._excelService.exportAsExcelFile(this.reporte, 'xlsx');
      Swal.close();
    } else {
      Swal.close();
      this.invalido('No se puede exportar datos de la nada!!!');
    }
  }

  invalido(invalido) {
    this.toastr.error(invalido, 'Invalido',
      { timeOut: 2500 });
  }

}
