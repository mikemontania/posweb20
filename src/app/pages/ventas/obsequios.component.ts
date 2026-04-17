/**
 * ObsequiosComponent — página de obsequios (gifts)
 * ─────────────────────────────────────────────────
 * Versión simplificada del POS de ventas:
 *   - Cliente propietario fijo (sin buscador ni cambio)
 *   - Precio costo, sin descuentos
 *   - Sin cobranza — guarda directo con cobranza=null
 *   - Reutiliza pos-catalogo, pos-detalle, pos-totales
 */
import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { ObsequiosFacadeService } from './obsequios-facade.service';
import { VentasStateService }     from './ventas-state.service';
import { PosCatalogoComponent }   from '../../shared/components/pos/pos-catalogo.component';
import { PosDetalleComponent }    from '../../shared/components/pos/pos-detalle.component';
import { PosTotalesComponent }    from '../../shared/components/pos/pos-totales.component';

@Component({
  selector: 'app-obsequios',
  standalone: true,
  providers: [VentasStateService, ObsequiosFacadeService],
  imports: [CommonModule, FormsModule,
    PosCatalogoComponent, PosDetalleComponent, PosTotalesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './obsequios.component.html',
  styleUrl:    './obsequios.component.css',
})
export class ObsequiosComponent implements OnInit, OnDestroy {

  readonly facade = inject(ObsequiosFacadeService);
  readonly st     = inject(VentasStateService);
  private  cdr    = inject(ChangeDetectorRef);

  tabActivo: 'carrito' | 'catalogo' = 'catalogo';
  terminalSel = 0;

  // ── Ciclo de vida ──────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await this.facade.initTerminal();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.facade.cancelarStockAlSalir();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.facade.cancelarStockAlSalir();
  }

  // ── Catálogo ───────────────────────────────────────────────────────────────

  onProductoClick(ev: { producto: any; cantidad: number }): void {
    this.facade.seleccionarProducto(ev.producto, ev.cantidad)
      .then(() => this.cdr.markForCheck());
  }

  onPageChange(p: number): void {
    this.facade.cargarProductos(p - 1, this.busquedaActual, this.catActiva);
  }

  onBusquedaChange(q: string): void {
    this.busquedaActual = q;
    this.facade.cargarProductos(0, q, this.catActiva);
  }

  onCategoriaChange(cod: number): void {
    this.catActiva = cod;
    this.facade.cargarProductos(0, this.busquedaActual, cod);
  }

  private busquedaActual = '';
  private catActiva = 0;

  // ── Carrito ────────────────────────────────────────────────────────────────

  onRestar(item: any): void {
    this.facade.restarProducto(item).then(() => this.cdr.markForCheck());
  }

  onAgregar(item: any): void {
    this.facade.seleccionarProducto(item.producto, 1)
      .then(() => this.cdr.markForCheck());
  }

  onQuitar(item: any): void {
    this.facade.quitarProductoCompleto(item).then(() => this.cdr.markForCheck());
  }

  // ── Acciones principales ───────────────────────────────────────────────────

  onGuardar(): void {
    this.facade.guardarObsequio().then(() => this.cdr.markForCheck());
  }

  onCancelar(): void {
    if (this.st.ventaDetalles().length > 0) {
      if (!confirm('¿Cancelar el obsequio? Se perderán los productos cargados.')) return;
    }
    this.facade.limpiar();
    this.cdr.markForCheck();
  }
}