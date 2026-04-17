import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { MedioPago } from '../../models/medioPago.model';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';
import { LoginService } from '../../services/service.index';

@Component({
  selector: 'app-medioPago',
  templateUrl: './medioPago.component.html',
  styles: []
})
export class MedioPagoComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  medios: MedioPago[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;  rutaPaginador: string = '/medioPago/page';
  constructor(private _medioPagoService: MedioPagoService,
    private activatedRoute: ActivatedRoute,
    private _loginService: LoginService,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this.traerMedioPago();
  }

  delete(medio: MedioPago): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el medio ${medio.descripcion}?`,
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
        this._medioPagoService.delete(medio.codMedioPago).subscribe(
          () => {
            this.medios = this.medios.filter(m => m !== medio);
            Swal.fire(
              'Medio pago Eliminado!',
              `Medio ${medio.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

  traerMedioPago() {
    this._medioPagoService.traerMedioPago(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.medios = response as MedioPago[];
          console.log(this.medios);
        } else {
          this.medios = [];
        }
      });
  }
}
