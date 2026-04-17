import { Component, OnInit } from '@angular/core';
import { LoginService, GrupoDescuentoService } from '../../services/service.index';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { GrupoDescuento } from '../../models/grupoDescuento.model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-grupoDescuento',
  templateUrl: './grupoDescuento.component.html',
  styles: []
})
export class GrupoDescuentoComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  grupos: GrupoDescuento[] = [];
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;

  constructor(private _grupoDescuentoService: GrupoDescuentoService,
    private _loginService: LoginService,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._grupoDescuentoService.getByEmpresa(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.grupos = response as GrupoDescuento[];
          console.log(this.grupos);
        } else {
          this.grupos = [];
        }
      });
  }
  delete(g: GrupoDescuento): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el grupo  ${g.descripcion}?`,
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
        this._grupoDescuentoService.delete(g.codGrupo).subscribe(
          () => {
            this.grupos = this.grupos.filter(gr => gr !== g);
            Swal.fire(
              'Grupo Descuento Eliminado!',
              `Grupo ${g.descripcion} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
