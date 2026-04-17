import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { Deposito } from '../../models/deposito.model';
import { DepositoService } from '../../services/deposito/deposito.service';

@Component({
  selector: 'app-depositos',
  templateUrl: './depositos.component.html',
  styles: []
})
export class DepositosComponent implements OnInit {
  tamanhoPag: string = 'md';
  cargando: boolean = false;
  depositos: Deposito[] = [];
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;


 rutaPaginador: string = '/depositos/page';
  constructor(private _depositosService: DepositoService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this._depositosService.getByCodEmp(this._loginService.user.codEmpresa)
    .subscribe((response: any) => {
      if (response) {
        this.depositos = response as Deposito[];
        console.log(this.depositos);
      } else {
        this.depositos = [];
      }
    });
  }
    delete(depositos: Deposito): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el deposito ${depositos.nombreDeposito}?`,
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
        this._depositosService.delete(depositos.codDeposito).subscribe(
          () => {
            this.depositos = this.depositos.filter(de => de !== depositos);
            Swal.fire(
              'Deposito Eliminado!',
              `Deposito ${depositos.nombreDeposito} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }

}
