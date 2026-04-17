import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService, TipoMedioPagoService, LoginService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { TipoMedioPago } from '../../models/tipoMedioPago.model';

@Component({
  selector: 'app-tipoMedioPago',
  templateUrl: './tipoMedioPago.component.html',
  styles: []
})
export class TipoMedioPagoComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  tipoMedioPago: TipoMedioPago[] = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;  rutaPaginador: string = '/tipoMedioPago/page';
  constructor(private _tipoMedioPagoService: TipoMedioPagoService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this._tipoMedioPagoService.traerByCodEmp(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.tipoMedioPago = response as TipoMedioPago[];
        } else {

          this.tipoMedioPago = [];
        }
      });
  }
  delete(tipoMedioPago: TipoMedioPago): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el tipoMedioPago ${tipoMedioPago.descripcion}?`,
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
        this._tipoMedioPagoService.delete(tipoMedioPago.codTipoMedioPago).subscribe(
          () => {
            this.tipoMedioPago = this.tipoMedioPago.filter(com => com !== tipoMedioPago);
            Swal.fire(
              'Tipo Medio pago Eliminado!',
              `Tipo Medio pago ${tipoMedioPago.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
