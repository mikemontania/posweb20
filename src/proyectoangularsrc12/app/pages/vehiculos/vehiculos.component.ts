import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { Vehiculo } from '../../models/vehiculo.model';
import { VehiculoService } from '../../services/service.index';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  styles: []
})
export class VehiculosComponent implements OnInit {
  cargando: boolean = false;
vehiculos: Vehiculo[] = [];
tamanhoPag: string = 'md';

  paginador: any;
  paginas = [];
  busqueda: string = '';
  totalElementos: number = 0;
  currentPage: number;
  pageSize: number;


 rutaPaginador: string = '/vehiculos/page';
  constructor(private _vehiculosService: VehiculoService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
   }

  ngOnInit() {
    this._vehiculosService.getByCodEmp(this._loginService.user.codEmpresa)
    .subscribe((response: any) => {
      if (response) {
        this.vehiculos = response as Vehiculo[];
        console.log(this.vehiculos);
      } else {
        this.vehiculos = [];
      }
    });
    //this.asyncro();
  }
    delete(ve: Vehiculo): void {
    Swal.fire({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar el vehiculo con nro de chasis ${ve.nroChasis}?`,
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
        this._vehiculosService.delete(ve.codVehiculo).subscribe(
          () => {
            this.vehiculos = this.vehiculos.filter(vehiculos => vehiculos !== ve);
            Swal.fire(
              'Vehiculo Eliminado!',
              `Vehiculo ${ve.nroChasis} eliminado con éxito.`,
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
