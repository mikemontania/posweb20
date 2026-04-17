import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Cupon } from '../../models/cupon.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { LoginService } from '../../services/login/login.service';
import { CuponService } from 'src/app/services/service.index';

@Component({
  selector: 'app-cupones',
  templateUrl: './cupones.component.html',
  styles: []
})
export class CuponesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  cargando: boolean = false;
  cupones: Cupon[] = [];
  tamanhoPag: string = 'md';
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/cupones/page';
  constructor(private _cuponService: CuponService,
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
      this.getCupones(page, this.busqueda);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscarCupones(termino: string) {

    this.router.navigate(['/cupones/page', 0]);
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
    this.getCupones(0, termino.toUpperCase());
  }

  getCupones(page, termino) {
    this._cuponService.getCuponesPorPaginas(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.cupones = response.content as Cupon[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.cupones = [];
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

  delete(cupon) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el cupon ${cupon.descripcion}?`,
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
        this._cuponService.deleteCupon(cupon.codCupon).subscribe(
          () => {
            this.cupones = this.cupones.filter(des => des !== cupon);
            Swal.fire(
              'Cupon Eliminado!',
              `Cupon ${cupon.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }


  updateEstado(cupon) {
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
        this._cuponService.updateEstado(cupon.codCupon).subscribe(modificado => {

          let indice = this.cupones.findIndex((l) => l.codCupon == cupon.codCupon);

          this.cupones[indice].activo = modificado.activo;
          Swal.fire(
            'Cupon Modificado!',
            `Cupon ${cupon.descripcion} modificado con éxito.`,
            'success'
          );
        }
        );

      }
    });
  }
}