import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { SucursalesService, LoginService, DepositoService, VehiculoService } from '../../services/service.index';
import { Deposito } from '../../models/deposito.model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-deposito',
  templateUrl: './ng-select-deposito.component.html',
  providers: [VehiculoService],
  styles: [` `]
})
export class NGSelectDepositoComponent implements OnInit {
  depositos: Deposito[] = [];
  searching: boolean = false;
  searchFailed: boolean = false;
  model: any;
  @Input() cargadorDeposito: Deposito;
  @Input() disabled: boolean = false;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Deposito> = new EventEmitter();

  ngOnInit() {
    this.cargar();
  }

  constructor(public _depositoServices: DepositoService, private _loginService: LoginService) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._depositoServices.getByCodEmpAndCodSuc(this._loginService.user.codEmpresa, 0).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )



  formatter = (result: Deposito) => result.nombreDeposito;
  onFocus(e: Event): void {
    e.stopPropagation();
    setTimeout(() => {
      const inputEvent: Event = new Event('input');
      e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  cargar() {
    this._depositoServices.getByCodEmpAndCodSuc(this._loginService.user.codEmpresa, 0).subscribe(depositos => {
      this.depositos = depositos as Deposito[];
      console.log(this.depositos);
    });
  }

  selectedItem(item) {
    this.cargadorDeposito = item;
    this.retornoObjeto.emit(this.cargadorDeposito);
  }
  limpiar() {
    this.cargadorDeposito = null;
    this.retornoObjeto.emit(this.cargadorDeposito);
  }
}
