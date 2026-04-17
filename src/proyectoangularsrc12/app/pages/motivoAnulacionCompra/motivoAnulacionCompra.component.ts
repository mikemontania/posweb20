import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, MotivoAnulacionCompraService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

import { LoginService } from '../../services/login/login.service'; 
import { MotivoAnulacionCompra } from '../../models/motivoAnulacionCompra.model';
@Component({
  selector: 'app-motivoAnulacionCompra',
  templateUrl: './motivoAnulacionCompra.component.html',
  styles: []
})
export class MotivoAnulacionCompraComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando: boolean = false;
  motivosAnulacion: MotivoAnulacionCompra[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
  rutaPaginador: string = '/motivoAnulacionCompra/page';
  constructor(private _motivoAnulacionCompraService: MotivoAnulacionCompraService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._motivoAnulacionCompraService.traerByCodEmp(this._loginService.user.codEmpresa)
      .subscribe((response: any) => {
        if (response) {
          this.motivosAnulacion = response as MotivoAnulacionCompra[];
          console.log(this.motivosAnulacion);
        } else {
          this.motivosAnulacion = [];
        }
      });
  }
  delete(ba: MotivoAnulacionCompra): void {
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
        this._motivoAnulacionCompraService.delete(ba.codMotivoCompra).subscribe(
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
