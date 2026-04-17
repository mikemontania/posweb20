import { Component, Input, OnInit, EventEmitter, ElementRef, Output } from '@angular/core';
import { CategoriaProducto } from '../../models/categoriaProducto.model';

@Component({
  selector: 'app-barra-categoria',
  templateUrl: './barra-categoria.component.html',
  styles: []
})
export class BarraCategoriaComponent implements OnInit {
  @Input() items: CategoriaProducto[];
  @Input() categoriaSeleccionada: CategoriaProducto;
  @Output('retornoCategoria') retornoCategoria: EventEmitter<CategoriaProducto> = new EventEmitter();
  tabs: number[];
  totalTabs: number = 3;
  constructor() {

  }
  ngOnInit() {

  }

  retornarCategoria(evento) {
    this.categoriaSeleccionada = evento;
    this.retornoCategoria.emit(this.categoriaSeleccionada);
  }
}
