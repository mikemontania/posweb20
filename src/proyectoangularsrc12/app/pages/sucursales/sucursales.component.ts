import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Sucursal } from '../../models/sucursal.model';
import { SucursalesService } from '../../services/Sucursales/sucursales.service';
import { Descuento } from '../../models/descuento.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { LoginService } from '../../services/service.index';
@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styles: []
})
export class SucursalesComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  sucursales: Sucursal[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;  rutaPaginador: string = '/sucursales/page';
  constructor(private _sucursalesService: SucursalesService,
    private _loginService: LoginService,

    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this.router.navigate(['/sucursales/page', 0]);
    /*==========Observa la paginación =======================*/
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate(['/sucursales/page', 0]);
      }
      this.traersucursales(page, this.busqueda);
    });
    /*=====================================================*/
  }

  delete(sucursales: Sucursal): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la sucursal ${sucursales.nombreSucursal}?`,
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
        this._sucursalesService.deleteSucursal(sucursales.codSucursal).subscribe(
          () => {
            this.sucursales = this.sucursales.filter(suc => suc !== sucursales);
            Swal.fire(
              'sucursales Eliminado!',
              `sucursales ${sucursales.nombreSucursal} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
  buscarSucursal(termino: string) {

    this.router.navigate(['/sucursales/page', 0]);
    console.log(' buscarProducto');
    debounceTime(300);
    distinctUntilChanged();
    if (termino.length <= 2) {
      this.busqueda = '';
      this.ngOnInit();
      return;
    }
    // setTimeout(() => {
    this.cargando = false;
    this.busqueda = termino.toUpperCase();
    this.traersucursales(0, termino.toUpperCase());
  }
  traersucursales(page, termino) {
    this._sucursalesService.traerSucursales(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.sucursales = response as Sucursal[];
          console.log(this.sucursales);
        } else {
          this.sucursales = [];
        }

      });
  }
}
