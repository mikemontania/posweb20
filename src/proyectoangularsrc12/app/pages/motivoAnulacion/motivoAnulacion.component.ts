import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

import { LoginService } from '../../services/login/login.service';
import { MotivoAnulacion } from '../../models/motivoAnulacion.model';
import { MotivoAnulacionService } from '../../services/motivoAnulacion/motivoAnulacion.service';
@Component({
  selector: 'app-motivoAnulacion',
  templateUrl: './motivoAnulacion.component.html',
  styles: []
})
export class MotivoAnulacionComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando: boolean = false;
  motivosAnulacion: MotivoAnulacion[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
  rutaPaginador: string = '/motivoAnulacion/page';
  constructor(private _motivoAnulacionService: MotivoAnulacionService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._motivoAnulacionService.traerByCodEmp(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.motivosAnulacion = response as MotivoAnulacion[];
          console.log(this.motivosAnulacion);
        } else {
          this.motivosAnulacion = [];
        }
      });
  }
  delete(ba: MotivoAnulacion): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el motivo de anulación ${ba.descripcion}?`,
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
        this._motivoAnulacionService.delete(ba.codMotivoAnulacion).subscribe(
          () => {
            this.motivosAnulacion = this.motivosAnulacion.filter(motivo => motivo !== ba);
            Swal.fire(
              'Motivo Eliminado!',
              `Motivo de anulación ${ba.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
