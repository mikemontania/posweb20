import { Component, OnInit } from '@angular/core';
import { Vendedor } from '../../models/vendedor.model';
import { VendedorService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styles: []
})
export class VendedoresComponent implements OnInit {
  cargando: boolean = false;
  vendedores: Vendedor[] = [];
  paginador: any;
  tamanhoPag: string = 'md';
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/vendedores/page';
  constructor(private _vendedorService: VendedorService,
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
      this.traerVendedores(page, this.busqueda);
    });
    /*=====================================================*/
  }


  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }


  delete(vendedor: Vendedor): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar al vendedor ${vendedor.vendedor}?`,
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
        this._vendedorService.delete(vendedor.codVendedor).subscribe(
          () => {
            this.vendedores = this.vendedores.filter(cli => cli !== vendedor);
            Swal.fire(
              'Vendedor Eliminado!',
              `Vendedor ${vendedor.vendedor} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
  buscarVendedor(termino: string) {

    this.router.navigate(['/vendedores/page', 0]);
    console.log(' buscarProducto');
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
    this.traerVendedores(0, termino.toUpperCase());
  }
  traerVendedores(page, termino) {
    this._vendedorService.getByPageAndkeyword(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        this.vendedores = response.content as Vendedor[];
        console.log(this.vendedores);
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.vendedores = [];
        } else {
          this.cargando = false;
        }
      });
  }
}
