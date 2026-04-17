import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService, LoginService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { UnidadMedidaService } from '../../services/unidadMedida/unidadMedida.service';

@Component({
  selector: 'app-unidadmedida',
  templateUrl: './unidadMedida.component.html',
  styles: []
})
export class UnidadMedidaComponent implements OnInit {
  cargando: boolean = false;
  unidades: UnidadMedida[] = [];
  tamanhoPag: string = 'md';
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  ellipses: boolean = false;
  pageSize: number; rutaPaginador: string = '/unidadMedida/page';
  constructor(private _unidadMedidaService: UnidadMedidaService,
    private _loginService: LoginService,
 
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {  
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this.traerUnidades();
  }

    delete(unidad: UnidadMedida): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la unidad de medida ${unidad.nombreUnidad}?`,
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
        this._unidadMedidaService.delete(unidad.codUnidad).subscribe(
          () => {
            this.unidades = this.unidades.filter(m => m !== unidad);
            Swal.fire(
              'Unidad de media Eliminada!',
              `Unidad ${unidad.nombreUnidad} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

  traerUnidades( ) {
    this._unidadMedidaService.traerUnidadMedida(this._loginService.user.codEmpresa)
     .subscribe((response: any) => {
       if (response) {
         this.unidades = response as UnidadMedida[];
         console.log(this.unidades);
       } else {
        this.unidades = [];
       }
     });
 }
}
