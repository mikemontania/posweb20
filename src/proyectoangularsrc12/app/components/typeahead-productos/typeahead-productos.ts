import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges } from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { ProductoService } from '../../services/producto/producto.service';
import { Producto } from '../../models/producto.model';
@Component({
  selector: 'ngbd-typeahead-productos',
  templateUrl: './typeahead-productos.html',
  providers: [ProductoService],
  styles: [`::ng-deep .dropdown-menu { width: 100%; }`]
})
// tslint:disable-next-line:component-class-suffix
export class NgbdTypeaheadProductos {
  clickedItem: Producto;
  model: any;
  mensaje:boolean= false;;
  searching = false;
  searchFailed = false;
  @Input() cargadorProducto: Producto;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Producto> = new EventEmitter();
  constructor(public _productoServices: ProductoService) {}

  
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._productoServices.buscarProducto(term).pipe(
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
          this.mensaje = false;
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
    formatter = (x: {nombreProducto: string}) => x.nombreProducto;

    quitarProducto(value){
      console.log(value);
      /* if (value === '') {
        this.clickedItem =null;
        this.retornoObjeto.emit(this.clickedItem);
      } */
      if (value === '') {
       this.mensaje = true;
       this.clickedItem = null;
       this.retornoObjeto.emit(this.clickedItem);
      } else {
      if (value != this.clickedItem.codProducto) {
        this.mensaje = true;
        this.clickedItem = null;
        this.retornoObjeto.emit(this.clickedItem);
      } else {
        this.mensaje = false;
      }
      }
    }
}
