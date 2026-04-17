import { Component, OnInit } from '@angular/core';
import { Chofer } from '../../models/chofer.model';
import { ChoferService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-choferes',
  templateUrl: './choferes.component.html',
  styles: []
})
export class ChoferComponent implements OnInit {
  cargando: boolean = false;
  choferes: Chofer[] = [];
  paginador: any;
  tamanhoPag: string = 'md';
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/choferes/page';
  constructor(private _choferService: ChoferService,
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
      this.traerChofers(page, this.busqueda);
    });
    /*=====================================================*/
  }


  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }


  delete(chofer: Chofer): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar al chofer ${chofer.chofer}?`,
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
        this._choferService.delete(chofer.codChofer).subscribe(
          () => {
            this.choferes = this.choferes.filter(c => c !== chofer);
            Swal.fire(
              'Chofer Eliminado!',
              `Chofer ${chofer.chofer} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
  buscarChofer(termino: string) {

    this.router.navigate(['/choferes/page', 0]);
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
    this.traerChofers(0, termino.toUpperCase());
  }
  traerChofers(page, termino) {
    this._choferService.traerClientesPorPaginas(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        this.choferes = response.content as Chofer[];
        console.log(this.choferes);
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.choferes = [];
        } else {
          this.cargando = false;
        }
      });
  }
}
