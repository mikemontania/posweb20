import {Component, Injectable, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { ClienteService } from '../../services/cliente/cliente.service';
import { Cliente } from '../../models/cliente.model';
@Component({
  selector: 'select-th-cliente',
  templateUrl: './select-th-cliente.html',
  providers: [ClienteService],
  styles: [`
/*   ::ng-deep .dropdown-menu { width: 100%; } */
.typeahead,
.tt-query,
.tt-hint {
  height: 30px;
  padding: 8px 12px;
  font-size: 24px;
  line-height: 30px;
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
  font-size: 18px;
  line-height: 24px;
  color: black;
}

.tt-suggestion.tt-cursor {
  color: #fff;
  background-color: #0097cf;
}

.tt-suggestion p {
  margin: 0;
  font-size: 18px;
  text-align: left;
}

.twitter-typeahead {
	width: 100%;
}
  `]
})
// tslint:disable-next-line:component-class-suffix
export class SelectThClienteComponent {
  @Input() cargadorCliente: Cliente;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Cliente> = new EventEmitter();
  razonSocial: string;
  mostrarCliente: boolean = false;
  ngOnInit() { this.mostrarCliente = false; }
  searching:boolean = false;
  searchFailed:boolean = false;

  constructor(public _clienteServices: ClienteService) {}

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._clienteServices.buscarClientesActivos(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )

    selectedItem(item: Cliente) {
      this.cargadorCliente = item;
     this.retornoObjeto.emit(  this.cargadorCliente);
     this.mostrarCliente = true;
     this.razonSocial = item.concatDocNombre
    }

    onFocus(e: Event): void {
      e.stopPropagation();
      setTimeout(() => {
          const inputEvent: Event = new Event('input');
          e.target.dispatchEvent(inputEvent);
      }, 0);
  }

    formatter = (result: Cliente) => result.concatDocNombre;

    limpiar(){
      this.cargadorCliente = null;
      this.retornoObjeto.emit(this.cargadorCliente);
    }
}