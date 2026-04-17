import { Component, Injectable, Output, EventEmitter, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import { Usuarios } from '../../models/usuarios.model';
import { UsuarioService } from '../../services/usuario/usuario.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-select-usuario',
  templateUrl: './ng-select-usuario.component.html',
  providers: [UsuarioService],
  styles: [`
 
`],
})
export class NGSelectUsuarioComponent implements OnInit {
  searching: boolean = false;
  searchFailed: boolean = false;
  cargando: boolean = false;
    usuarios: Usuarios [] = [];
  model: any;
  nombrePersona: string;
  @Input() cargadorUsuario: Usuarios;
  @Output('retornoObjeto') retornoObjeto: EventEmitter<Usuarios> = new EventEmitter();

  ngOnInit() {  
    this.cargarUsuarios();
  }

  constructor(public _usuarioServices: UsuarioService) {}


  cargarUsuarios() {
    this._usuarioServices.traerUsuarios(0, '').subscribe(resp => {
      this.usuarios = resp as Usuarios[];
      console.log(this.usuarios);
      this.searchFailed = false;
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
  console.log(term);
  this._usuarioServices.traerUsuariosPorPaginasComponente(0, term)
   .subscribe((response: any) => {
    console.log(response.content);
    this.usuarios = response.content;
  /*   this.paginador = response;
    this.totalElementos = response.totalElements; */
    if (response.empty === true) {
      this.cargando = true;
      this.usuarios = null;
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
      this.cargadorUsuario = item;
     this.retornoObjeto.emit(  this.cargadorUsuario);
    }
    limpiar(){
      this.cargadorUsuario = null;
      this.retornoObjeto.emit(this.cargadorUsuario);
    }

}
