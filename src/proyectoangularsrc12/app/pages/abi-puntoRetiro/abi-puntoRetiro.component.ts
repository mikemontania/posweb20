import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { ABI_Punto_Retiro } from '../../models/abi-punto-retiro.model';
import { AbiOrdenService } from '../../services/abi-orden/abi-orden.service';

@Component({
  selector: 'app-abi-puntoRetiro',
  templateUrl: './abi-puntoRetiro.component.html',
  styles: []
})
export class ABIPuntoRetiroComponent implements OnInit {
  cargando: boolean = false;
puntosRetiro: ABI_Punto_Retiro[] = [];
tamanhoPag: string = 'md';
  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;


 rutaPaginador: string = '/abi-puntosRetiro/page';
  constructor(private _abiService: AbiOrdenService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this._abiService.getPuntoRetiro()
    .subscribe((response: any) => {
      if (response) {
        this.puntosRetiro = response as ABI_Punto_Retiro[];
        console.log(this.puntosRetiro);
      } else {
        this.puntosRetiro = [];
      }
    });
   
  }
    delete(p: ABI_Punto_Retiro): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el punto de retiro ${p.nombre}?`,
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
        this._abiService.deletePuntoRetiro(p.id).subscribe(
          () => {
            this.puntosRetiro = this.puntosRetiro.filter(puntosRetiro => puntosRetiro !== p);
            Swal.fire(
              'puntosRetiro Eliminado!',
              `puntosRetiro ${p.nombre} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }
 
}
