import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { Alianza } from '../../models/alianza.model';
import { AlianzasService } from '../../services/service.index';

@Component({
  selector: 'app-alianzas',
  templateUrl: './alianzas.component.html',
  styles: []
})
export class AlianzasComponent implements OnInit {
  cargando: boolean = false;
  alianzas: Alianza[] = [];
  tamanhoPag: string = 'md';

  paginador: any;
  paginas = [];
  busqueda: string = '';
  currentPage: number;
  pageSize: number;


  rutaPaginador: string = '/alianzas/page';
  constructor(private _alianzasService: AlianzasService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._alianzasService.traerByCodEmp(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.alianzas = response as Alianza[];
          console.log(this.alianzas);
        } else {
          this.alianzas = [];
        }
      });
  }
  delete(ba: Alianza): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la alianza ${ba.alianza}?`,
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
        this._alianzasService.delete(ba.codAlianza).subscribe(
          () => {
            this.alianzas = this.alianzas.filter(alianzas => alianzas !== ba);
            Swal.fire(
              'Alianza Eliminada!',
              `Alianza ${ba.alianza} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }



}
