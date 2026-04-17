import {Component, Injectable, Output, EventEmitter, ElementRef } from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { ClienteService } from '../../services/cliente/cliente.service';
import { Cliente } from '../../models/cliente.model';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngbd-typeahead-http',
  templateUrl: './typeahead-http.html',
  providers: [ClienteService],
  styles: [`
  ::ng-deep .dropdown-menu {
.typeahead,
.tt-query,
.tt-hint {
  height: 30px;
  padding: 8px 12px;
  font-size: 10px;
    font: 70%;
  line-height: 20px;
  border: 2px solid #ccc;
  -webkit-border-radius: 8px;
     -moz-border-radius: 8px;
          border-radius: 8px;
  outline: none;
}
 
.typeahead {
  background-color: #fff;
}

.typeahead:focus {
  border: 2px solid #0097cf;
}

.tt-query {
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
     -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}

.tt-hint {
  color: #999
}

.tt-dropdown-menu {
  width: 422px;
  margin-top: 3px;
  padding: 8px 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, 0.2);
  -webkit-border-radius: 8px;
     -moz-border-radius: 8px;
          border-radius: 8px;
  -webkit-box-shadow: 0 5px 10px rgba(0,0,0,.2);
     -moz-box-shadow: 0 5px 10px rgba(0,0,0,.2);
          box-shadow: 0 5px 10px rgba(0,0,0,.2);
}

.tt-suggestion {
  padding: 3px 20px;
  font-size: 10px;
    font: 70%;
  line-height: 20px;
  color: black;
}

.tt-suggestion.tt-cursor {
  color: #fff;
  background-color: #0097cf;
}

.tt-suggestion p {
  margin: 0;
  font-size: 10px;
    font: 70%;
  text-align: left;
}

.twitter-typeahead {
	width: 100%;
}
  }
  `]
})
// tslint:disable-next-line:component-class-suffix
export class NgbdTypeaheadHttp {
  clickedItem: Cliente;
  model: any;
  searching = false;
  searchFailed = false;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Cliente> = new EventEmitter();
  constructor(public _clientesServices: ClienteService) {}

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._clientesServices.buscarClientesActivos(term).pipe(
          tap(() => this.searchFailed = false),
      catchError(() => {
          this.searchFailed = true;
          return of([]);
      }))
      ),
      tap(() => this.searching = false)
    )
    selectedItem(item) {
        this.clickedItem = item;
        if (this.clickedItem) {
            this.retornoObjeto.emit(this.clickedItem);
        }
      }
    onFocus(e: Event): void {
        e.stopPropagation();
        setTimeout(() => {
            const inputEvent: Event = new Event('input');
            e.target.dispatchEvent(inputEvent);
        }, 0);
    }
    formatter = (x: {concatDocNombre: string}) => x.concatDocNombre;
 }
