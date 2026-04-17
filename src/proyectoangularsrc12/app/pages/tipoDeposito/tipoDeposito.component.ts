import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { CategoriaProducto } from '../../models/categoriaProducto.model';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { LoginService } from '../../services/login/login.service';
import { TipoDeposito } from '../../models/tipoDeposito.model';
import { TipoDepositoService } from '../../services/tipoDeposito/tipoDeposito.service';

@Component({
  selector: 'app-tipoDeposito',
  templateUrl: './tipoDeposito.component.html',
  styles: []
})
export class TipoDepositoComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  tipos: TipoDeposito[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
 rutaPaginador: string = '/categoria/page';
  constructor(
    private _tipoDepositoService: TipoDepositoService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this.get();
  }
    delete(t: TipoDeposito): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el tipo ${t.descripcion}?`,
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
        this._tipoDepositoService.delete(t.codTipoDeposito).subscribe(
          () => {
            this.tipos = this.tipos.filter(ti => ti !== t);
            Swal.fire(
              'Tipo de deposito Eliminado!',
              `Tipo de deposito ${t.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

  get( ) {
    this._tipoDepositoService.getByCodEmpr(this._loginService.user.codEmpresa)
     .subscribe((response: any) => {
       if (response) {
         this.tipos = response as TipoDeposito[];
         console.log(this.tipos);
       } else {
        this.tipos = [];
       }
     });
 }
}
