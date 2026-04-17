import { Component, OnInit } from '@angular/core';
import { UsuarioService, LoginService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Terminales } from '../../models/terminales.model';
import { TerminalService } from '../../services/terminales/terminales.service';

@Component({
  selector: 'app-terminales',
  templateUrl: './terminales.component.html',
  styles: []
})
export class TerminalesComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  terminales: Terminales[] = [];
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;
  constructor(private _terminalService: TerminalService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._terminalService.traerterminales(this._loginService.user.codEmpresa, this._loginService.user.codSucursal)
      .subscribe((response: any) => {
        if (response) {
          this.terminales = response as Terminales[];

        } else {
          this.terminales = [];

        }
      });
  }

  delete(terminal: Terminales): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar la terminal ${terminal.descripcion}?`,
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
        this._terminalService.delete(terminal.codTerminalVenta).subscribe(
          () => {
            this.terminales = this.terminales.filter(m => m !== terminal);
            Swal.fire(
              'Terminal Eliminada!',
              `Terminal ${terminal.descripcion} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }


}
