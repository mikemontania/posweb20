import { Component, OnInit } from '@angular/core';
import {  UsuarioService, LoginService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ComprobantesService } from '../../services/comprobantes/comprobantes.service';
import { Comprobantes } from '../../models/comprobantes.model';

@Component({
  selector: 'app-comprobantes',
  templateUrl: './comprobantes.component.html',
  styles: []
})
export class ComprobanteComponent implements OnInit {
  cargando: boolean = false;
  totalElementos: number = 0;
  tamanhoPag: string = 'md';
  currentPage: number;
  pageSize: number;
  comprobantes: Comprobantes[] = [];
  constructor(private _comprobanteService: ComprobantesService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { 
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._comprobanteService.traerComprobantes(this._loginService.user.codEmpresa)
    .subscribe((response: any) => {
      if (response) {
        this.comprobantes = response as Comprobantes[];
        console.log(this.comprobantes);
      } else {
        this.comprobantes = [];
      }
    });
  }
    delete(comprobante: Comprobantes): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el comprobante ${comprobante.nroComprobante}?`,
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
        this._comprobanteService.delete(comprobante.codNumeracion).subscribe(
          () => {
            this.comprobantes = this.comprobantes.filter(com => com !== comprobante);
            Swal.fire(
              'Comprobante Eliminado!',
              `Comprobante ${comprobante.nroComprobante} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
