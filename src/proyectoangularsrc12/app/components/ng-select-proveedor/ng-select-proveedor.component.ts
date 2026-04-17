import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ProveedorService } from '../../services/service.index';
import { Proveedor } from '../../models/proveedor.model';

@Component({
  selector: 'ng-select-proveedor',
  templateUrl: './ng-select-proveedor.component.html',
  providers: [ProveedorService],
  styles: [ ]
})
export class NGSelectProveedorComponent implements OnInit {
  model: any;
  proveedores: Proveedor [] = [];
  @Input() cargadorProveedor: Proveedor;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Proveedor> = new EventEmitter();
  searching: boolean = false;
  searchFailed: boolean = false;
  people: any [] = [];
  peopleLoading = false;

  constructor(public _proveedorServices: ProveedorService, private http: HttpClient) {}

  ngOnInit() {
    this.cargar();
}

cargar() {
  this._proveedorServices.cargar().subscribe(resp => {
    this.proveedores = resp.content as Proveedor [];
    console.log(this.proveedores);
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
  this._proveedorServices.buscarActivos(term).subscribe(proveedores => {
    this.proveedores = proveedores as Proveedor [];
    console.log(this.proveedores);
    });
}
    selectedItem(item) {
      this.cargadorProveedor = item;
     this.retornoObjeto.emit(  this.cargadorProveedor);
    }
    limpiar(){
      this.cargadorProveedor = null;
      this.retornoObjeto.emit(this.cargadorProveedor);
    }
}