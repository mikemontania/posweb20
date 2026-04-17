import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { ClienteService } from '../../services/cliente/cliente.service';
import { HttpClient } from '@angular/common/http';
import { ClienteGoogle } from 'src/app/models/clienteGoogle.model';
import { ClienteGoogleService } from 'src/app/services/cliente/cliente-google.service';

@Component({
  selector: 'ng-select-cgoogle',
  templateUrl: './ng-select-cliente-google.component.html',
  providers: [ClienteService],
  styles: [ ]
})
export class NGSelectClienteGoogleComponent implements OnInit {
  model: any;
  clientesGoogle: ClienteGoogle [] = [];
  @Input() cargadorClienteGoogle: ClienteGoogle;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<ClienteGoogle> = new EventEmitter();
  searching: boolean = false;
  searchFailed: boolean = false;
  people: any [] = [];
  peopleLoading = false;


   

  constructor(public _clienteGoogleServices: ClienteGoogleService, private http: HttpClient) {}

  ngOnInit() {
    this.cargarClientes();
}

cargarClientes() {
  this._clienteGoogleServices.traerClientesGoogle(0, '').subscribe(resp => {
    this.clientesGoogle = resp.content as ClienteGoogle [];
    console.log(this.clientesGoogle);
    });
}

onSearch(event) {
  let term = event.term;
  debounceTime(300);
  distinctUntilChanged();
  if (term.length <= 1) {
    this.ngOnInit();
  return;
}
  console.log(term);
  this._clienteGoogleServices.traerClientesGoogle(0, term).subscribe(resp => {
    this.clientesGoogle = resp.content as ClienteGoogle [];
    console.log(this.clientesGoogle);
    });
}
    selectedItem(item) {
      this.cargadorClienteGoogle = item;
     this.retornoObjeto.emit(  this.cargadorClienteGoogle);
    }
    limpiar(){
      this.cargadorClienteGoogle = null;
      this.retornoObjeto.emit(this.cargadorClienteGoogle);
    }
}