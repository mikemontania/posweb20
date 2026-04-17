import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { UnidadMedida } from '../../models/unidadMedida.model';
import { SucursalesService, LoginService } from '../../services/service.index';
 import { UnidadMedidaService } from '../../services/unidadMedida/unidadMedida.service';
 

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-unidad',
  templateUrl: './ng-select-unidad.component.html',
  providers: [SucursalesService],
  styles: [` `]
})
export class NGSelectUnidadComponent implements OnInit {
  unidades: UnidadMedida[] = [];
  searching: boolean = false;
  searchFailed: boolean = false;
  model: any;
  @Input() cargadorUnidad: UnidadMedida;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<UnidadMedida> = new EventEmitter();

  ngOnInit() {
    this.cargarUnidades()
  }

  constructor(public _unidadServices: UnidadMedidaService, private _loginService: LoginService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._unidadServices.traerUnidadMedida(this._loginService.user.codEmpresa).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )



  formatter = (result: UnidadMedida) => result.nombreUnidad;
  onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  cargarUnidades() {
    this._unidadServices.traerUnidadMedida(this._loginService.user.codEmpresa).subscribe(unidades => {
      this.unidades = unidades as UnidadMedida[];
      console.log(this.unidades);
    });
  }
 
  selectedItem(item) {
    this.cargadorUnidad = item;
    this.retornoObjeto.emit(this.cargadorUnidad);
  }
  limpiar() {
    this.cargadorUnidad = null;
    this.retornoObjeto.emit(this.cargadorUnidad);
  }
}
