// pos-cobranza — modal completo de cobranza
// Inputs:  open, venta, medioPago[], tipoMedioPago[], bancos[], clientePref
// Outputs: guardar(payload), cerrar()
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnChanges, SimpleChanges
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule }  from '@angular/forms';

@Component({
  selector: 'app-pos-cobranza',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pos-cobranza.component.html',
  styleUrl:    './pos-cobranza.component.css',
})
export class PosCobranzaComponent implements OnChanges {
  @Input() open        = false;
  @Input() venta: any  = null;
  @Input() medioPago:      any[] = [];
  @Input() tipoMedioPago:  any[] = [];
  @Input() bancos:          any[] = [];
  @Input() clientePref: any = null;  // para medioPagoPref default

  @Output() guardar = new EventEmitter<{
    cobranzasDetalle: any[];
    totalAbonado: number;
    vuelto: number;
  }>();
  @Output() cerrar = new EventEmitter<void>();

  // Estado interno del formulario de cobranza
  cobranzasDetalle: any[]  = [];
  codCobranzaDetalle       = 1;
  totalAbonado             = 0;
  vuelto                   = 0;

  selectModelMedio: any         = null;
  selectModelTipoMedioPago: any = null;
  selectModelBanco: any         = null;
  seleccionMedioPago: number | null = null;
  montoAbonado    = 0;
  nroRef          = '';
  nroCuenta       = '';
  fechaEmision    = '';
  fechaVencimiento = '';

  ngOnChanges(ch: SimpleChanges): void {
    // Reiniciar cuando se abre el modal
    if (ch['open']?.currentValue === true) {
      this.cobranzasDetalle   = [];
      this.totalAbonado       = 0;
      this.vuelto             = 0;
      this.codCobranzaDetalle = 1;
      this.montoAbonado       = 0;
      this.nroRef = this.nroCuenta = this.fechaEmision = this.fechaVencimiento = '';
      this.selectModelTipoMedioPago = null;
      this.selectModelBanco         = null;
      // Pre-seleccionar medio pago del cliente
      const codPref = this.clientePref?.medioPagoPref?.codMedioPago ?? this.medioPago[0]?.codMedioPago;
      if (codPref) this.cambioMedio(codPref);
    }
  }

  get importeCobrado(): number { return Math.round(this.venta?.importeTotal ?? 0); }

  cambioMedio(cod: number): void {
    this.montoAbonado = 0; this.selectModelBanco = null;
    this.fechaEmision = this.fechaVencimiento = this.nroCuenta = this.nroRef = '';
    this.selectModelTipoMedioPago = null;
    this.seleccionMedioPago = cod;
    this.selectModelMedio   = this.medioPago.find(m => m.codMedioPago == cod) ?? null;
  }

  agregar(): void {
    if (this.montoAbonado < 100) return;
    if (!this.selectModelMedio) return;
    if (this.selectModelMedio.tieneRef && this.nroRef && this.nroRef.length < 10)
      this.nroRef = this.nroRef.padStart(10, '0');

    const det = {
      codCobranzaDetalle: this.codCobranzaDetalle++,
      importeAbonado: this.montoAbonado, importeCobrado: 0, saldo: 0,
      medioPago: this.selectModelMedio, tipoMedioPago: this.selectModelTipoMedioPago,
      fechaEmision: this.fechaEmision, fechaVencimiento: this.fechaVencimiento,
      nroRef: this.nroRef, banco: this.selectModelBanco, nroCuenta: this.nroCuenta,
    };

    // Agrupar si mismo medio (excepto tarjeta cod=2)
    if (this.selectModelMedio.codMedioPagoErp !== '2') {
      const idx = this.cobranzasDetalle.findIndex(c => c.medioPago.codMedioPago === det.medioPago.codMedioPago);
      if (idx >= 0) {
        this.cobranzasDetalle[idx].importeAbonado += det.importeAbonado;
        this.totalAbonado += det.importeAbonado;
        this.vuelto = this.totalAbonado - this.importeCobrado;
        this.montoAbonado = 0; return;
      }
    }
    this.cobranzasDetalle.push(det);
    this.totalAbonado += det.importeAbonado;
    this.vuelto = this.totalAbonado - this.importeCobrado;
    this.montoAbonado = 0;
    this.selectModelTipoMedioPago = null;
  }

  quitar(item: any): void {
    this.totalAbonado -= item.importeAbonado;
    this.cobranzasDetalle.splice(this.cobranzasDetalle.indexOf(item), 1);
    this.vuelto = Math.max(0, this.totalAbonado - this.importeCobrado);
  }

  usar(monto: number): void { this.montoAbonado = monto; }

  onGuardar(): void {
    if (this.importeCobrado > this.totalAbonado) return;
    this.guardar.emit({ cobranzasDetalle: this.cobranzasDetalle, totalAbonado: this.totalAbonado, vuelto: this.vuelto });
  }

  toUpc(v: string): string { return v.toLocaleUpperCase(); }
}