import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { SucursalesService, LoginService, DepositoService, VehiculoService, MotivoTransferenciaService } from '../../services/service.index';
 import { MotivoTransferencia } from '../../models/motivoTransferencia.model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-motivo-transferencia',
  templateUrl: './ng-select-motivo-transferencia.component.html',
  providers: [VehiculoService],
  styles: [` `]
})
export class NGSelectMotivoTransferenciaComponent implements OnInit {
  motivos: MotivoTransferencia[] = [];
  searching: boolean = false;
  searchFailed: boolean = false;
  model: any;
  @Input() cargadorMotivoTransferencia: MotivoTransferencia;
  @Input() disabled: boolean = false;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<MotivoTransferencia> = new EventEmitter();

  ngOnInit() {
    this.cargar();
  }

  constructor(public _motivoServices: MotivoTransferenciaService, private _loginService: LoginService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._motivoServices.traerByCodEmp(this._loginService.user.codEmpresa).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )



  formatter = (result: MotivoTransferencia) => result.descripcion;
  onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  cargar() {
    this._motivoServices.traerByCodEmp(this._loginService.user.codEmpresa).subscribe(motivos => {
      this.motivos = motivos as MotivoTransferencia[];
      console.log(this.motivos);
    });
  }

  selectedItem(item) {
    this.cargadorMotivoTransferencia = item;
    this.retornoObjeto.emit(this.cargadorMotivoTransferencia);
  }
  limpiar() {
    this.cargadorMotivoTransferencia = null;
    this.retornoObjeto.emit(this.cargadorMotivoTransferencia);
  }
}
