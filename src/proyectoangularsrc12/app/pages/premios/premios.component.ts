import { Component, OnInit } from '@angular/core'; 
import { PremioService } from '../../services/premio/premio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2'; 
import { Premio } from '../../models/premio.model ';

@Component({
  selector: 'app-premios',
  templateUrl: './premios.component.html',
  styles: []
})
export class PremiosComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando2: boolean = true;
  cargando: boolean = false;
  premios: Premio[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/sin-imagen.jpg';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/premios/page';
  constructor(private _premiosService: PremioService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.cargando = false;
    this.cargando2 = true;
    this.busqueda = '';
    this.traerPremios(0, this.busqueda);

    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }

      this.traerPremios(page, this.busqueda);
    });
    /*=====================================================*/
  }



  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }




  buscarPremios(termino: string) {

    this.router.navigate(['/premios/page', 0]);
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
    this.traerPremios(0, termino.toUpperCase());
  }

  traerPremios(page, termino) {
    // this.cargando = true;
    this._premiosService.traerPremiosPorPaginasComponente(page, termino,1,999999999)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response);
        console.log(response.content);
        this.premios = response.content as Premio[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.premios = [];
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

  delete(premio) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el Premio ${premio.descripcion}?`,
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
        this._premiosService.deletePremio(premio.codPremio).subscribe(
          () => {
            this.premios = this.premios.filter(pro => pro !== premio);
            Swal.fire(
              'Premios Eliminado!',
              `Premios ${premio.descripcion} eliminado con éxito.`,
              'success'
            );
            this.cargando = false;
            this.cargando2 = true;
            this.busqueda = '';
            this.traerPremios(0, this.busqueda);
          }
        );

      }
    });
  }
 
}
