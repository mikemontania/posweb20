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

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styles: []
})
export class CategoriaComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  categorias: CategoriaProducto[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
 rutaPaginador: string = '/categoria/page';
  constructor(private _categoriaService: CategoriaService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this.traerCategoria();
  }
    delete(cate: CategoriaProducto): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la categoria ${cate.descripcion}?`,
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
        this._categoriaService.delete(cate.codCategoriaProducto).subscribe(
          () => {
            this.categorias = this.categorias.filter(categoria => categoria !== cate);
            Swal.fire(
              'Categoria de producto Eliminado!',
              `Categoria ${cate.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }  

  traerCategoria( ) {
    this._categoriaService.traerCategoria(this._loginService.user.codEmpresa)
     .subscribe((response: any) => {
       if (response) {
         this.categorias = response as CategoriaProducto[];
         console.log(this.categorias);
       } else {
        this.categorias = [];
       }
     });
 }
}
