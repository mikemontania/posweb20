import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { SucursalesService, LoginService, VehiculoService } from '../../services/service.index';
import { Vehiculo } from '../../models/vehiculo.model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-vehiculo',
  templateUrl: './ng-select-vehiculo.component.html',
  providers: [VehiculoService],
  styles: [` `]
})
export class NGSelectVehiculoComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  searching: boolean = false;
  searchFailed: boolean = false;
  model: any;
  @Input() disabled: boolean = false;
  @Input() cargadorVehiculo: Vehiculo;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Vehiculo> = new EventEmitter();

  ngOnInit() {
    this.cargar();
  }

  constructor(public _vehiculoServices: VehiculoService, private _loginService: LoginService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._vehiculoServices.getByCodEmpresa(this._loginService.user.codEmpresa).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )



  formatter = (result: Vehiculo) => result.concatMarcaModeloChapa;
  onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  cargar() {
    this._vehiculoServices.getByCodEmpresa(this._loginService.user.codEmpresa).subscribe(v => {
      this.vehiculos = v as Vehiculo[];
      console.log(this.vehiculos);
    });
  }

  selectedItem(item) {
    this.cargadorVehiculo = item;
    this.retornoObjeto.emit(this.cargadorVehiculo);
  }
  limpiar() {
    this.cargadorVehiculo = null;
    this.retornoObjeto.emit(this.cargadorVehiculo);
  }
}
