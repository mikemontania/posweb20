import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }          from '../../core/services/auth.service';
import { StockPremioService }   from '../../core/services/domain/stock-premio.service';
import { SucursalService }      from '../../core/services/domain/sucursal.service';
import { PremioService }        from '../../core/services/domain/premio.service';
import { ToastService }         from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

const OPERACIONES = ['ENTRADA', 'OBSEQUIO', 'INVENTARIO'];

@Component({
  selector: 'app-mv-stock-premio',
  standalone: true,
  imports: [DecimalPipe, FormsModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mv-stock-premio.component.html',
  styleUrl: './mv-stock-premio.component.css',
})
export class MvStockPremioComponent implements OnInit {
  readonly auth              = inject(AuthService);
  private readonly svc       = inject(StockPremioService);
  private readonly sucSvc    = inject(SucursalService);
  private readonly premioSvc = inject(PremioService);
  private readonly toast     = inject(ToastService);

  readonly operaciones = OPERACIONES;

  sucursales   = signal<any[]>([]);
  premios      = signal<any[]>([]);
  guardando    = signal(false);

  // cabecera
  operacion      = signal<string>('ENTRADA');
  nroComprobante = signal('');
  selSucursal    = signal<any>(null);

  // detalle en construcción
  mostrarDetalle = signal(false);
  selPremio      = signal<any>(null);
  detOp          = signal('ENTRADA');
  detCantidad    = signal(1);

  // líneas del movimiento
  lineas = signal<{ premio: any; operacion: string; cantidad: number }[]>([]);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;

    this.premioSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.premios.set(Array.isArray(r) ? r : (r.content ?? []))
    });

    if (this.isAdmin()) {
      this.sucSvc.getAll({ codempresa: codEmp }).subscribe({
        next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? []))
      });
    } else if (codSuc > 0) {
      this.sucSvc.getById(codSuc).subscribe({
        next: (s: any) => { this.selSucursal.set(s); this.sucursales.set([s]); }
      });
    }
  }

  habilitarDetalle(): void {
    if (this.operacion() === 'ENTRADA' && this.nroComprobante().trim().length < 12) {
      this.toast.error('Nº Comprobante es obligatorio para ENTRADA');
      return;
    }
    const op = this.operacion() === 'OBSEQUIO' ? 'SALIDA' : 'ENTRADA';
    this.detOp.set(op);
    this.detCantidad.set(1);
    this.selPremio.set(null);
    this.mostrarDetalle.set(true);
  }

  agregarLinea(): void {
    if (!this.selPremio()) {
      this.toast.error('Seleccione un premio');
      return;
    }
    if (!this.detCantidad() || this.detCantidad() <= 0) {
      this.toast.error('Cantidad debe ser mayor a 0');
      return;
    }
    const premio   = this.selPremio();
    const operacion = this.detOp();
    const cantidad  = this.detCantidad();
    const current  = this.lineas();
    const idx      = current.findIndex(l => l.premio.codPremio === premio.codPremio && l.operacion === operacion);
    if (idx === -1) {
      this.lineas.set([...current, { premio, operacion, cantidad }]);
    } else {
      const updated = [...current];
      updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + cantidad };
      this.lineas.set(updated);
    }
    this.selPremio.set(null);
    this.detCantidad.set(1);
  }

  quitarLinea(index: number): void {
    this.lineas.set(this.lineas().filter((_, i) => i !== index));
  }

  guardar(): void {
    if (!this.selSucursal()) {
      this.toast.error('Seleccione una sucursal');
      return;
    }
    if (this.lineas().length === 0) {
      this.toast.error('Agregue al menos un ítem de detalle');
      return;
    }
    const sess = this.auth.session!;
    const body = {
      codStockPremioCab: null,
      codEmpresa:   sess.codEmpresa,
      codSucursal:  this.selSucursal().codSucursal,
      codUsuario:   sess.codUsuario,
      usuario:      sess.username,
      operacion:    this.operacion(),
      nroComprobante: this.nroComprobante(),
      cantidadItems: this.lineas().length,
      detalle: this.lineas().map(l => ({
        codStockPremioDet: null,
        premio:    l.premio,
        operacion: l.operacion,
        cantidad:  l.cantidad,
      })),
    } as any;

    this.guardando.set(true);
    this.svc.createMovimiento(body).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success('Movimiento registrado correctamente');
        this.resetear();
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }

  resetear(): void {
    this.operacion.set('ENTRADA');
    this.nroComprobante.set('');
    this.lineas.set([]);
    this.mostrarDetalle.set(false);
    this.selPremio.set(null);
    this.detCantidad.set(1);
    // mantener sucursal pre-seleccionada para no-admin
    if (this.isAdmin()) this.selSucursal.set(null);
  }

  onOperacionChange(op: string): void {
    this.operacion.set(op);
    this.nroComprobante.set('');
    this.mostrarDetalle.set(false);
    this.lineas.set([]);
  }

  isAdmin(): boolean {
    return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  opcionesDetalle(): string[] {
    if (this.operacion() === 'OBSEQUIO')   return ['SALIDA'];
    if (this.operacion() === 'ENTRADA')    return ['ENTRADA'];
    return ['ENTRADA', 'SALIDA'];
  }
}
