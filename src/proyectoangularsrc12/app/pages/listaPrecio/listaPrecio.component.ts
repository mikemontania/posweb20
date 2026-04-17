import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { ListaPrecio } from '../../models/listaPrecio.model';
import { ListaPrecioService } from '../../services/ListaPrecio/listaPrecio.service';
@Component({
  selector: 'app-listaPrecio',
  templateUrl: './listaPrecio.component.html',
  styles: []
})
export class ListaPrecioComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  listaPrecio: ListaPrecio[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
  rutaPaginador: string = '/listaPrecio/page';
  constructor(private _listaPrecioService: ListaPrecioService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._listaPrecioService.traerListaPrecio(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.listaPrecio = response as ListaPrecio[];
          console.log(this.listaPrecio);
        } else {
          this.listaPrecio = [];
        }
      });
  }





  
  delete(lista: ListaPrecio): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la lista ${lista.descripcion}?`,
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
        this._listaPrecioService.delete(lista.codListaPrecio).subscribe(
          () => {
            this.listaPrecio = this.listaPrecio.filter(l => l !== lista);
            Swal.fire(
              'Lista Eliminado!',
              `Lista ${lista.descripcion} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
