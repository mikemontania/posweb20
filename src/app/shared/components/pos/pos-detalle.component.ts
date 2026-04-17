// pos-detalle — lista tipo recibo del carrito con +/−/quitar + modal de detalles con descuentos
// Inputs:  ventaDetalles[], descuentos[], disabled
// Outputs: restar(item), quitar(item), agregarUno(item), quitarDescuento(descuento)
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagenPipe }  from '../../pipes/imagen.pipe';
import { PosCantidadComponent } from './pos-cantidad.component';

@Component({
  selector: 'app-pos-detalle',
  standalone: true,
  imports: [CommonModule, ImagenPipe, PosCantidadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pos-detalle.component.html',
  styleUrl:    './pos-detalle.component.css',
})
export class PosDetalleComponent implements AfterViewChecked {
  @ViewChild('listaScroll') private listaScroll!: ElementRef;

  /** Auto-scroll al último ítem igual que ng12 [scrollTop]="scrollBody.scrollHeight" */
  ngAfterViewChecked(): void {
    if (this.listaScroll?.nativeElement) {
      this.listaScroll.nativeElement.scrollTop = this.listaScroll.nativeElement.scrollHeight;
    }
  }

  @Input() ventaDetalles: any[] = [];
  @Input() descuentos:    any[] = [];
  @Input() disabled             = false;

  @Output() restar           = new EventEmitter<any>();
  @Output() quitar           = new EventEmitter<any>();
  @Output() agregarUno       = new EventEmitter<any>();
  @Output() quitarDescuento  = new EventEmitter<any>();

  modalOpen = signal(false);

  abrirModal(): void  { this.modalOpen.set(true); }
  cerrarModal(): void { this.modalOpen.set(false); }
}