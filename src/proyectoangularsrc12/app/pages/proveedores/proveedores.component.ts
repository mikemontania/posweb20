import { Component, OnInit } from '@angular/core';
 import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Proveedor } from '../../models/proveedor.model';
import { ProveedorService } from '../../services/service.index';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styles: []
})
export class ProveedoresComponent implements OnInit {
  cargando: boolean = false;
  proveedores: Proveedor[] = [];
  paginador: any;
  tamanhoPag: string = 'md';
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/proveedores/page';
  constructor(private _proveedoresService: ProveedorService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.traer(page, this.busqueda);
    });
    /*=====================================================*/
  }


  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }


  delete(p: Proveedor): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar al proveedor ${p.razonSocial}?`,
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
        this._proveedoresService.delete(p.codProveedor).subscribe(
          () => {
            this.proveedores = this.proveedores.filter(cli => cli !== p);
            Swal.fire(
              'Proveedor Eliminado!',
              `Proveedor ${p.razonSocial} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
  buscar(termino: string) {

    this.router.navigate(['/proveedores/page', 0]);
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
    this.traer(0, termino.toUpperCase());
  }
  traer(page, termino) {
    this._proveedoresService.traerPorPaginas(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        this.proveedores = response.content as Proveedor[];
        console.log(this.proveedores);
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.proveedores = [];
        } else {
          this.cargando = false;
        }
      });
  }
}
