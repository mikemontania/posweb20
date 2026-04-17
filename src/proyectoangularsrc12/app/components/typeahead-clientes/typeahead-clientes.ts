import {Component, Injectable, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { ClienteService } from '../../services/cliente/cliente.service';
import { Cliente } from '../../models/cliente.model';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngbd-typeahead-clientes',
  templateUrl: './typeahead-clientes.html',
  providers: [ClienteService],
  styles: [`::ng-deep .dropdown-menu { width: 100%; }`]
})
// tslint:disable-next-line:component-class-suffix
export class NgbdTypeaheadClientes {
  clickedItem: Cliente;
  model: any;
  searching = false;
  searchFailed = false;
  @Input() cargadorClientes: Cliente;
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


    quitarCliente(value) {
      console.log(value);
      if (value === '') {
        console.log('vacio');
        this.clickedItem = null;
        this.retornoObjeto.emit(this.clickedItem);
      }
    }
}
