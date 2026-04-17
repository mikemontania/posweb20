import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService, LoginService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { FormaVenta } from '../../models/formaVenta.model';
import { FormaPagoService } from '../../services/formaPago/forma-pago.service';
import { FormaVentaService } from '../../services/formaVenta/formaVenta.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-formaVenta',
  templateUrl: './formaVenta.component.html',
  styles: []
})
export class FormaVentaComponent implements OnInit {
  cargando: boolean = false;
  tamanhoPag: string = 'md';
  formas: FormaVenta[] = [];
totalElementos: number = 0;
currentPage: number;
pageSize: number;
 
  constructor(private _formaVentaService: FormaVentaService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) { 
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this._formaVentaService.traerFormaVenta(this._loginService.user.codEmpresa)
    .subscribe((response: any) => {
      if (response) {
        this.formas = response as FormaVenta[];
        console.log(this.formas);
      } else {
        this.formas = [];
      }
    });
  }
    delete(form: FormaVenta): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el forma  ${form.descripcion}?`,
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
        this._formaVentaService.delete(form.codFormaVenta).subscribe(
          () => {
            this.formas = this.formas.filter(formas => formas !== form);
            Swal.fire(
              'Forma venta Eliminada!',
              `Forma ${form.descripcion} eliminada con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
