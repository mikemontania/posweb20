import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { CreditosService, LoginService } from '../../services/service.index';
import Swal from 'sweetalert2';

import 'jspdf-autotable';
import * as moment from 'moment';
import { Credito } from 'src/app/models/credito';
import { ObjetoSelector } from 'src/app/models/ObjetoSelector';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/models/cliente.model';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-creditos',
  templateUrl: './creditos.component.html',
  styles: [``]
})
export class CreditosComponent implements OnInit {
  mask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  fechaInicio: string;
  fechafin: string;
  estado: any = 'TODOS'; // Inicializa correctamente el estado con "TODOS"
  estadosCredito = [
    { id: 'PENDIENTE', texto: 'Pendiente' },
    { id: 'PAGADO', texto: 'Pagado' },
    { id: null, texto: 'Todos' }
  ];
  ellipses: boolean = false;
  creditos: Credito[] = [];
  resumenCredito = {
    totalMonto: 0,
    totalVencidos: 0,
    totalPagados: 0,
    totalPendientesACobrar: 0,
    totalCreditos: 0,
    cantidadPagados: 0,
    cantidadPendientes: 0,
    cantidadVencidos: 0
  };

  resumenCreditoFecha = {
    totalMonto: 0,
    totalVencidos: 0,
    totalPagados: 0,
    totalPendientesACobrar: 0,
    totalCreditos: 0,
    cantidadPagados: 0,
    cantidadPendientes: 0,
    cantidadVencidos: 0
  };
  totalElementos: number = 0;
  cantidadElementos: number = 0;
  tamanhoPag: string = 'md';
  size: number;
  pagina: number = 1;
  tamanoPagina: number = 10;
  paginador: any;
  cargando: boolean = false;
  mostrar: boolean = false;
  nroComprobante: string;
  cargadorCliente: Cliente;
  public numeros: ObjetoSelector[] = [
    { cod: 10, descripcion: '10', enum: '10' },
    { cod: 15, descripcion: '15', enum: '15' },
    { cod: 20, descripcion: '20', enum: '20' },
    { cod: 25, descripcion: '25', enum: '25' },
    { cod: 30, descripcion: '30', enum: '30' },
    { cod: 40, descripcion: '40', enum: '40' },
    { cod: 50, descripcion: '50', enum: '50' },
    { cod: 100, descripcion: '100', enum: '100' },
    { cod: 200, descripcion: '200', enum: '200' },
    { cod: 300, descripcion: '300', enum: '300' },
    { cod: 400, descripcion: '400', enum: '400' },
    { cod: 500, descripcion: '500', enum: '500' },
    { cod: 600, descripcion: '600', enum: '600' },
  ];
  estados: any[] = [
    { id: 'TODOS', descripcion: 'TODOS' },
    { id: 'VENCIDO', descripcion: 'VENCIDO' },
    { id: 'PENDIENTE', descripcion: 'PENDIENTE' },
    { id: 'PAGADO', descripcion: 'PAGADO' },
  ];
  rutaPaginador: string = '/creditos/page';

  constructor(private creditosService: CreditosService,
    public _loginService: LoginService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.estado = this.estados[0].id; // Usa 'id' en lugar de 'valor'
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.fechafin = moment(new Date()).format('YYYY-MM-DD');
    this.cargadorCliente = null;
    this.nroComprobante = null;
    this.buscar();

  }
  buscar(): void {
    this.obtenerResumen();
    this.creditosService.buscarCreditos(
      this.fechaInicio,
      this.fechafin,
      this._loginService.user.codEmpresa, // Suponiendo un código de empresa fijo
      this.cargadorCliente?.codCliente || null,
      this.nroComprobante || null,
      this.estado || null,
      this.pagina - 1,
      this.tamanoPagina
    ).subscribe(respuesta => {
      console.log('respuesta', respuesta);
      this.creditos = respuesta.content as Credito[];
      this.paginador = respuesta;
      this.totalElementos = respuesta.totalElements;
      this.size = respuesta.size;
      this.cantidadElementos = respuesta.size;

      if (this.paginador.empty === true) {
        this.creditos = [];
        this.cargando = false;
      } else {
        this.mostrar = true;
        this.cargando = false;

      }
    });
  }



  obtenerResumen(): void {
    const codEmpresa = this._loginService.user.codEmpresa;
    const resumenNormal$ = this.creditosService.buscarResumen(this.fechaInicio, this.fechafin, codEmpresa);
    const resumenGlobal$ = this.creditosService.buscarResumen('2000-01-01', '9999-12-31', codEmpresa);
    forkJoin([resumenNormal$, resumenGlobal$]).subscribe(([resumenNormal, resumenGlobal]) => {
      if (resumenNormal) {
        this.resumenCredito = resumenNormal;
      }
      if (resumenGlobal) {
        this.resumenCreditoFecha = resumenGlobal;
      }
    });
  }

  cambioEstado(estado: any) {
    if (estado !== undefined && estado !== null) {
      this.estado = estado.id;
    } else {
      this.estado = null; // Mantiene 'Todos' seleccionado
    }
  }
  cambioPagina(event: number): void {
    this.pagina = event;
    this.buscar();
  }
  clean() {

    this.buscar();
  }
  pagarCredito(credito: any) {
    Swal.fire({
      title: '¿Confirmar pago?',
      text: `Está a punto de registrar el pago de Gs. ${credito.saldoPendiente.toLocaleString()}.`, type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, pagar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.creditosService.pagarCredito(credito.codCredito).subscribe(() => {
          this.buscar(); // Refresca los datos
          Swal.fire('¡Pago registrado!', 'El pago ha sido realizado con éxito.', 'success');
        });
      }
    });
  }
  seleccionarCliente(item: Cliente) {
    this.cargadorCliente = item;
  }

  cambioNumero(EVENTO: any) {
    this.size = EVENTO;
  }



  loadPage(page: number) {
    if (page !== this.paginador) {
      this.paginador = page - 1;
      this.router.navigate([this.rutaPaginador, this.paginador]);
    }
  }
}
