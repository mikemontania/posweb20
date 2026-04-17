import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente/cliente.service';
import { HttpClient } from '@angular/common/http';
import { VendedorService } from '../../services/service.index';
import { Vendedor } from '../../models/vendedor.model';

@Component({
  selector: 'ng-select-vendedor',
  templateUrl: './ng-select-vendedor.component.html',
  providers: [VendedorService],
  styles: []
})
export class NGSelectVendedorComponent implements OnInit {
  model: any;
  vendedores: Vendedor[] = [];
  @Input() cargadorVendedor: Vendedor;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Vendedor> = new EventEmitter();
  searching: boolean = false;
  searchFailed: boolean = false;
  people: any[] = [];
  peopleLoading = false;

  constructor(public _vendedorServices: VendedorService, private http: HttpClient) { }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this._vendedorServices.cargar().subscribe(resp => {
      this.vendedores = resp.content as Vendedor[];
      console.log(this.vendedores);
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
    this._vendedorServices.buscarActivos(term).subscribe(v => {
      this.vendedores = v as Vendedor[];
      console.log(this.vendedores);
    });
  }
  selectedItem(item) {
    this.cargadorVendedor = item;
    this.retornoObjeto.emit(this.cargadorVendedor);
  }
  limpiar() {
    this.cargadorVendedor = null;
    this.retornoObjeto.emit(this.cargadorVendedor);
  }
}