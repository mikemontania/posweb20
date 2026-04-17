import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Descuento } from '../../models/descuento.model';
import { DescuentoService } from '../../services/service.index';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Sucursal } from '../../models/sucursal.model';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  styles: []
})
export class DescuentosComponent implements OnInit {
  sucursales: Sucursal[] = [];
  cargando: boolean = false;
  descuentos: Descuento[] = [];
  tamanhoPag: string = 'md';
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/descuentos/page';
  constructor(private _descuentoService: DescuentoService,
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
      this.getDescuentos(page, this.busqueda);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }

  buscarDescuentos(termino: string) {

    this.router.navigate(['/descuentos/page', 0]);
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
    this.getDescuentos(0, termino.toUpperCase());
  }

  getDescuentos(page, termino) {
    this._descuentoService.getDescuentosPorPaginas(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.descuentos = response.content as Descuento[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.descuentos = [];
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

  delete(descuento) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el descuento ${descuento.descripcion}?`,
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
        this._descuentoService.deleteDescuento(descuento.codDescuento).subscribe(
          () => {
            this.descuentos = this.descuentos.filter(des => des !== descuento);
            Swal.fire(
              'Descuento Eliminado!',
              `Descuento ${descuento.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }


  updateEstado(descuento) {
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
        this._descuentoService.updateEstado(descuento.codDescuento).subscribe(         modificado => {
 
            let indice = this.descuentos.findIndex((l) => l.codDescuento == descuento.codDescuento);

            this.descuentos[indice].activo = modificado.activo;  
            Swal.fire(
              'Descuento Modificado!',
              `Descuento ${descuento.descripcion} modificado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
}