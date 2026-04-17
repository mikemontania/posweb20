import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login/login.service';
import { HistorialPunto } from '../../models/historialPuntos.modell';
import * as moment from 'moment';
import { Cliente } from '../../models/cliente.model';
import { HistorialPuntosService } from '../../services/service.index';

@Component({
  selector: 'app-historialPuntos',
  templateUrl: './historialPuntos.component.html',
  styles: []
})
export class HistorialPuntosComponent implements OnInit {
  cargando: boolean = false;
  historialPuntos: HistorialPunto[] = [];
  tamanhoPag: string = 'md';
  cargadorCliente: Cliente;
  fechaInicio: string;
  paginador: any;
  paginas = [];
  currentPage: number;
  pageSize: number;


  rutaPaginador: string = '/historialPuntos/page';
  constructor(private _historialPuntosService: HistorialPuntosService,
    private _loginService: LoginService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public http: HttpClient
  ) {
    this.currentPage = 1;
    this.pageSize = 10;
  }

  ngOnInit() {
    this.cargadorCliente = null;
    this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    this.getList(0, this.fechaInicio);

  }




  getList(codCliente, fecha) {
    this._historialPuntosService.getLista(codCliente, fecha)
      .subscribe((response: any) => {
        if (response) {
          this.historialPuntos = response as HistorialPunto[];
          console.log(this.historialPuntos);
        } else {
          this.historialPuntos = [];
        }
      });
  }

  buscar() {
    let codCliente = null;
    if (this.cargadorCliente) {
      codCliente = this.cargadorCliente.codCliente;
    }
    if (!this.fechaInicio) {
      this.fechaInicio = moment(new Date()).format('YYYY-MM-DD');
    }

    this.getList(codCliente, this.fechaInicio);
  }

  seleccionarCliente(item: Cliente) {
    this.cargadorCliente = item;
  }




}
