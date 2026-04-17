import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { SucursalesService, LoginService } from '../../services/service.index';
import { Sucursal } from '../../models/sucursal.model';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-sucursal',
  templateUrl: './ng-select-sucursal.component.html',
  providers: [SucursalesService],
  styles: [` `]
})
export class NGSelectSucursalComponent implements OnInit {
  sucursales: Sucursal[] = [];
  searching: boolean = false;
  searchFailed: boolean = false;
  model: any;
  @Input() disabled: boolean=false;
  @Input() cargadorSucursal: Sucursal;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Sucursal> = new EventEmitter();

  ngOnInit() {
    this.cargarSucursales()
  }

  constructor(public _sucursalServices: SucursalesService, private _loginService: LoginService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._sucursalServices.traerSucursales(this._loginService.user.codEmpresa).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )



  formatter = (result: Sucursal) => result.nombreSucursal;
  onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  cargarSucursales() {
    this._sucursalServices.traerSucursales(this._loginService.user.codEmpresa).subscribe(sucursales => {
      this.sucursales = sucursales as Sucursal[];
      console.log(this.sucursales);
    });
  }

  onSearch(event) {
    let term = event.term;
    debounceTime(300);
    distinctUntilChanged();
    if (term.length <= 2) {
      this.ngOnInit();
      return;
    }
    console.log(term.toUpperCase());
    this._sucursalServices.traerSucursalesPorPaginasComponente(0, term.toUpperCase()).subscribe(sucursales => {
      console.log(sucursales);
      this.sucursales = sucursales;
    });
  }


  selectedItem(item) {
    this.cargadorSucursal = item;
    this.retornoObjeto.emit(this.cargadorSucursal);
  }
  limpiar() {
    this.cargadorSucursal = null;
    this.retornoObjeto.emit(this.cargadorSucursal);
  }
}
