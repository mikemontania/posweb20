import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ChoferService } from '../../services/service.index';
import { Chofer } from '../../models/chofer.model';
@Component({
  selector: 'ng-select-chofer',
  templateUrl: './ng-select-chofer.component.html',
  providers: [ChoferService],
  styles: []
})
export class NGSelectChoferComponent implements OnInit {
  model: any;
  choferes: Chofer[] = [];
  @Input() cargadorChofer: Chofer;
  @Input() disabled: boolean=false;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Chofer> = new EventEmitter();
  searching: boolean = false;
  searchFailed: boolean = false;
  people: any[] = [];
  peopleLoading = false;
  constructor(public _choferServices: ChoferService, private http: HttpClient) { }

  ngOnInit() {
    this.cargar();
  }
  cargar() {
    console.log('Traer choferes');
    this._choferServices.cargar().subscribe(resp => {
      this.choferes = resp as Chofer[];
      console.log(this.choferes);
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
    this._choferServices.buscarActivos(term).subscribe(choferes => {
      this.choferes = choferes as Chofer[];
      console.log(this.choferes);
    });
  }
  selectedItem(item) {
    this.cargadorChofer = item;
    this.retornoObjeto.emit(this.cargadorChofer);
  }
  limpiar() {
    this.cargadorChofer = null;
    this.retornoObjeto.emit(this.cargadorChofer);
  }
}