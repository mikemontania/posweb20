import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { GrupoMaterial } from '../../models/grupoMaterial.model'; 
import { GrupoMaterialService } from '../../services/service.index';
@Component({
  selector: 'app-grupoMaterial',
  templateUrl: './grupoMaterial.component.html',
  styles: []
})
export class GrupoMaterialComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  grupoMaterial: GrupoMaterial[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
  rutaPaginador: string = '/grupoMaterial/page';
  constructor(private _grupoMaterialService: GrupoMaterialService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._grupoMaterialService.getByCodEmpresa(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.grupoMaterial = response as GrupoMaterial[];
          console.log(this.grupoMaterial);
        } else {
          this.grupoMaterial = [];
        }
      });
  }
 
  delete(grp: GrupoMaterial): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el grupo ${grp.descripcion}?`,
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
        this._grupoMaterialService.delete(grp.codGrupoErp).subscribe(
          () => {
            this.grupoMaterial = this.grupoMaterial.filter(g => g !== grp);
            Swal.fire(
              'Grupo Eliminado!',
              `Grupo ${grp.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
