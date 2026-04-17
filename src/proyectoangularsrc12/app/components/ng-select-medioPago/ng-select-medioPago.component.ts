import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { SucursalesService, LoginService } from '../../services/service.index';
import { Sucursal } from '../../models/sucursal.model';
import { MedioPago } from '../../models/medioPago.model';
import { MedioPagoService } from '../../services/MedioPago/medioPago.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-medioPago',
  templateUrl: './ng-select-medioPago.component.html',
  providers: [SucursalesService],
  styles: [` `]
})
export class NGSelectMedioPagoComponent implements OnInit {
  mediosDePago: MedioPago[] = [];
  @Input() cargadorMedioPago: MedioPago;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<MedioPago> = new EventEmitter();

  ngOnInit() {
    this.cargar()
  }

  constructor(public _medioPagoServices: MedioPagoService, private _loginService: LoginService) { }

  cargar() {
    this._medioPagoServices.traerMedioPago(this._loginService.user.codEmpresa).subscribe(resp => {
      this.mediosDePago = resp as MedioPago[];
      console.log(this.mediosDePago);
    });
  }

  selectedItem(item) {
    this.cargadorMedioPago = item;
    this.retornoObjeto.emit(this.cargadorMedioPago);
  }
  limpiar() {
    this.cargadorMedioPago = null;
    this.retornoObjeto.emit(this.cargadorMedioPago);
  }

}
