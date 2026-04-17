import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Punto } from '../../models/punto.model';
import { PuntoService } from '../../services/service.index';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-puntos',
  templateUrl: './puntos.component.html',
  styles: []
})
export class PuntosComponent implements OnInit {
  sucursales: Sucursal[] = [];
  cargando: boolean = false;
  puntos: Punto[] = [];
  tamanhoPag: string = 'md';
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/puntos/page';
  constructor(private _puntoService: PuntoService,
    private _sucursalesServices: SucursalesService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.traerSucursales();
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.getPuntos(page, this.busqueda);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscarPuntos(termino: string) {

    this.router.navigate(['/puntos/page', 0]);
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
    this.getPuntos(0, termino.toUpperCase());
  }

  getPuntos(page, termino) {
    this._puntoService.getPuntosPorPaginas(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.puntos = response.content as Punto[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.puntos = [];
        } else {
          this.cargando = false;
        }
      });
  }


  traerSucursales() {
    this._sucursalesServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(sucursales => {
      this.sucursales = sucursales;
    });
  }

  delete(punto) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el punto ${punto.descripcion}?`,
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
        this._puntoService.deletePunto(punto.codPunto).subscribe(
          () => {
            this.puntos = this.puntos.filter(des => des !== punto);
            Swal.fire(
              'Punto Eliminado!',
              `Punto ${punto.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }


  updateEstado(punto) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea cambiar de estado ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, modificar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this._puntoService.updateEstado(punto.codPunto).subscribe(         modificado => {
 
            let indice = this.puntos.findIndex((l) => l.codPunto == punto.codPunto);

            this.puntos[indice].activo = modificado.activo;  
            Swal.fire(
              'Punto Modificado!',
              `Punto ${punto.descripcion} modificado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
}