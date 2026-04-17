import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { LoginService } from '../../services/login/login.service';
import { BonificacionService } from 'src/app/services/service.index';
import { Bonificacion } from '../../models/bonificacion.model';

@Component({
  selector: 'app-bonificaciones',
  templateUrl: './bonificaciones.component.html',
  styles: []
})
export class BonificacionesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  cargando: boolean = false;
  bonificaciones: Bonificacion[] = [];
  tamanhoPag: string = 'md';
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/bonificaciones/page';
  constructor(private _bonificacionService: BonificacionService,
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
      this.getBonificaciones(page, this.busqueda);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscarbonificaciones(termino: string) {

    this.router.navigate(['/bonificaciones/page', 0]);
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
    this.getBonificaciones(0, termino.toUpperCase());
  }

  getBonificaciones(page, termino) {
    this._bonificacionService.getByPage(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.bonificaciones = response.content as Bonificacion[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.bonificaciones = [];
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

  delete(b) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la Bonificacion ${b.descripcion}?`,
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
        this._bonificacionService.delete(b.codDescuento).subscribe(
          () => {
            this.bonificaciones = this.bonificaciones.filter(des => des !== b);
            Swal.fire(
              'Bonificacion Eliminada!',
              `Bonificacion ${b.descripcion} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
}
