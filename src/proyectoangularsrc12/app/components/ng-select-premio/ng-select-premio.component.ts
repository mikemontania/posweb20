import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { Premio } from 'src/app/models/premio.model ';
import { PremioService } from 'src/app/services/service.index';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-premio',
  templateUrl: './ng-select-premio.component.html',
  styles: [`

`],
})
export class NGSelectPremioComponent implements OnInit {
  searching: boolean = false;
  searchFailed: boolean = false;
  cargando: boolean = false;
    premios: Premio [] = [];
  model: any;
  nombrePersona: string;
  @Input() cargadorPremio: Premio;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Premio> = new EventEmitter();

  ngOnInit() {
    this.cargar();
  }

  constructor(public _premioServices: PremioService) {}


  cargar() {
    this._premioServices.traerPremiosActivosPorPaginas(0, '',0,1000000).subscribe(resp => {
      this.premios = resp.content as Premio[];
      console.log(this.premios);
      this.searchFailed = false;
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
  this._premioServices.traerPremiosActivosPorPaginas(0 , term,0,1000000)
   .subscribe((response: any) => {
    console.log(response.content);
    this.premios = response.content;
    if (response.empty === true) {
      this.cargando = true;
      this.premios = null;
      this.searchFailed =true;
    } else {
     this.cargando = false;
     this.searchFailed = false;
    }
  });
}
    selectedItem(item) {
      this.cargadorPremio = item;
     this.retornoObjeto.emit(  this.cargadorPremio);
    }
    limpiar() {
       this.cargadorPremio = null;
      this.retornoObjeto.emit(this.cargadorPremio);
    }

}
