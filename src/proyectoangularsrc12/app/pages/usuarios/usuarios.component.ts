import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Usuarios } from '../../models/usuarios.model';
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: []
})
export class UsuariosComponent implements OnInit {
  cargando2: boolean = true;
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  usuarios: Usuarios[] = [];
  paginador: any;
  paginas = [];
  sinImagen: string = './assets/images/users/user_img.png';
  busqueda: string = '';
  totalElementos: number = 0;
  ellipses: boolean = false;
  cantidadElementos: number = 0;
  pagina: number = 0;
  rutaPaginador: string = '/usuarios/page';
  constructor(private _usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { }

  ngOnInit() {
    this.cargando = false;
    this.cargando2 = true;
    this.busqueda = '';
    /*   this.traerusuarios(0, this.busqueda); */

    /*     this.router.navigate(['/usuarios/page', 0] ); */
    /*==========Observa la paginación =======================*/
    this.router.navigate([this.rutaPaginador, 0]);
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');
      if (!page) {
        page = 0;
        this.router.navigate([this.rutaPaginador, 0]);
      }
      this.traerusuarios(page, this.busqueda);
    });
    /*=====================================================*/
  }

  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }


  buscarusuarios(termino: string) {

    this.router.navigate(['/usuarios/page', 0]);
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
    this.traerusuarios(0, termino.toUpperCase());
  }

  traerusuarios(page, termino) {
    this.cargando = true;
    this._usuarioService.traerUsuariosPorPaginasComponente(page, termino)
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((response: any) => {
        console.log(response.content);
        this.usuarios = response.content as Usuarios[];
        this.paginador = response;
        this.totalElementos = response.totalElements;
        this.cantidadElementos = response.size;
        if (this.paginador.empty === true) {
          this.cargando = false;
          this.usuarios = [];
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

  /*    delete(usuario) {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el usuario ${usuario.descripcion}?`,
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
        this._usuarioService.deleteUsuario(usuario.usuario).subscribe(
          () => {
            this.usuarios = this.usuarios.filter(pro => pro !== usuario);
            Swal.fire(
              'usuarios Eliminado!',
              `usuarios ${usuario.descripcion} eliminado con éxito.`,
              'success'
            );
            this.cargando = false;
            this.cargando2 = true;
            this.busqueda = '';
            this.traerusuarios(0, this.busqueda);
          }
        );

      }
    });
  }
   */



}
