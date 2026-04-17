import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { SucursalesService, LoginService, CategoriaService } from '../../services/service.index';
import { CategoriaProducto } from '../../models/categoriaProducto.model';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-categoria',
  templateUrl: './ng-select-categoria.component.html',
  providers: [CategoriaService],
  styles: [` `]
})
export class NGSelectCategoriaComponent implements OnInit {
  categorias: CategoriaProducto[] = [];
  searching: boolean = false;
  searchFailed: boolean = false;
  model: any;
  @Input() cargadorCategoria: CategoriaProducto;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<CategoriaProducto> = new EventEmitter();

  ngOnInit() {
    this.cargar();
  }

  constructor(public _categoriaServices: CategoriaService, private _loginService: LoginService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._categoriaServices.traerCategoria(this._loginService.user.codEmpresa).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )



  formatter = (result: CategoriaProducto) => result.descripcion;
  onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  cargar() {
    this._categoriaServices.traerCategoria(this._loginService.user.codEmpresa).subscribe(c => {
      this.categorias = c as CategoriaProducto[];
      this.categorias.unshift({
        codCategoriaProducto: 0,
        codCategoriaProductoErp: '99',
        descripcion: 'Todos',
        codEmpresa: this._loginService.user.codEmpresa
      });
      console.log(this.categorias);
    });
  }

  selectedItem(item) {
    this.cargadorCategoria = item;
    this.retornoObjeto.emit(this.cargadorCategoria);
  }
  limpiar() {
    this.cargadorCategoria = null;
    this.retornoObjeto.emit(this.cargadorCategoria);
  }
}
