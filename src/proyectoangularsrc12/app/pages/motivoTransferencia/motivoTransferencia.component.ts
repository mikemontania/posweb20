import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MotivoTransferenciaService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

import { LoginService } from '../../services/login/login.service';
import { MotivoTransferencia } from '../../models/motivoTransferencia.model';
@Component({
  selector: 'app-motivoTransferencia',
  templateUrl: './motivoTransferencia.component.html',
  styles: []
})
export class MotivoTransferenciaComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando: boolean = false;
  motivos: MotivoTransferencia[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
  rutaPaginador: string = '/motivoTransferencia/page';
  constructor(private _motivoTransferenciaService: MotivoTransferenciaService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._motivoTransferenciaService.traerByCodEmp(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.motivos = response as MotivoTransferencia[];
          console.log(this.motivos);
        } else {
          this.motivos = [];
        }
      });
  }
  delete(ba: MotivoTransferencia): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el motivo de transferencia ${ba.descripcion}?`,
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
        this._motivoTransferenciaService.delete(ba.codMotivoTransferencia).subscribe(
          () => {
            this.motivos = this.motivos.filter(motivo => motivo !== ba);
            Swal.fire(
              'Motivo Eliminado!',
              `Motivo de transferencia ${ba.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
