import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService, UsuarioService } from '../../services/service.index';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { BancosService } from '../../services/bancos/bancos.service';
import { Bancos } from '../../models/bancos.model';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styles: []
})
export class BancosComponent implements OnInit {
  cargando: boolean = false;
bancos: Bancos[] = [];
tamanhoPag: string = 'md';

  paginador: any;
  paginas = [];
  busqueda: string = ''; 
  currentPage: number;
  pageSize: number;


 rutaPaginador: string = '/bancos/page';
  constructor(private _bancosService: BancosService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this._bancosService.traerByCodEmp(this._loginService.user.codEmpresa)
    .subscribe((response: any) => {
      if (response) {
        this.bancos = response as Bancos[];
        console.log(this.bancos);
      } else {
        this.bancos = [];
      }
    });
    this.asyncro();
  }
    delete(ba: Bancos): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el banco ${ba.descripcion}?`,
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
        this._bancosService.delete(ba.codBanco).subscribe(
          () => {
            this.bancos = this.bancos.filter(bancos => bancos !== ba);
            Swal.fire(
              'Banco Eliminado!',
              `Banco ${ba.descripcion} eliminado con éxito.`,
              'success'
            );
          }
        );

      }
    });
  }





  





 async asyncro(): Promise<void> {
  //   let surname = await this.getValue('1');

  let x = await this.sumar();
  console.log('x', x);
  let y = await this.restar();
  console.log('y', y);
  let z = await this.multiplicar();
  console.log('z', z);
}

/* getValue(id: string): Promise<string> {
 return new Promise(resolve => {
             resolve('ok');
 });
} */

sumar(): Promise<string> {
return new Promise(resolve => {
 let a = (6+55);
 console.log('a',a)
 let b = (5+9);
 console.log('b',b)
 let c = (2+9);
 console.log('c',c)
 let d = (6+25);
 console.log('d',d)
           resolve('ok');
});
}

restar(): Promise<string> {
return new Promise(resolve => {
 let a = (68-55);
 console.log('e',a)
 let b = (58-9);
 console.log('f',b)
 let c = (28-9);
 console.log('g',c)
 let d = (68-25);
 console.log('h',d)
           resolve('ok');
});
}

multiplicar(): Promise<string> {
return new Promise(resolve => {
 let a = (68-55);
 console.log('g',a)
 let b = (58-9);
 console.log('h',b)
 let c = (28-9);
 console.log('i',c)
 let d = (68-25);
 console.log('j',d)
           resolve('ok');
});
}



}
