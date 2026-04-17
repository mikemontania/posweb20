import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
 import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto/producto.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-producto',
  templateUrl: './ng-select-producto.component.html',
  providers: [ProductoService],
  styles: [`
 
`],
})
export class NGSelectProductoComponent implements OnInit {
  searching: boolean = false;
  searchFailed: boolean = false;
  cargando: boolean = false;
    productos: Producto [] = [];
  model: any;
  nombrePersona: string;
  @Input() cargadorProducto: Producto;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Producto> = new EventEmitter();

  ngOnInit() {
    this.cargar();
  }

  constructor(public _productoServices: ProductoService) {}


  cargar() {
    this._productoServices.traerProductosActivosPorPaginas(0, '').subscribe(resp => {
      this.productos = resp.content as Producto[];
      console.log(this.productos);
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
  this._productoServices.traerProductosActivosPorPaginas(0 , term)
   .subscribe((response: any) => {
    console.log(response.content);
    this.productos = response.content;
  /*   this.paginador = response;
    this.totalElementos = response.totalElements; */
    if (response.empty === true) {
      this.cargando = true;
      this.productos = null;
      this.searchFailed =true;
    } else {
    /*  this.cargando = true;
     setTimeout(() => {
       console.log('hide');
       this.cargando = false;
     }, 2000); */
     this.cargando = false;
     this.searchFailed = false;
    }
  });
}
    selectedItem(item) {
      this.cargadorProducto = item;
     this.retornoObjeto.emit(  this.cargadorProducto);
    }
    limpiar() {
       this.cargadorProducto = null;
      this.retornoObjeto.emit(this.cargadorProducto);
    }

}
