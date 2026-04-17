import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }         from '../../core/services/auth.service';
import { ComprasService }      from '../../core/services/domain/compras.service';
import { ProveedorService }    from '../../core/services/domain/proveedor.service';
import { DepositoService }     from '../../core/services/domain/deposito.service';
import { ProductoService }     from '../../core/services/domain/producto.service';
import { UnidadMedidaService } from '../../core/services/domain/unidad-medida.service';
import { ToastService }        from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

interface LineaCompra {
  _id: number;
  producto: any | null;
  productos: any[];  // lista local para búsqueda
  unidadMedida: any | null;
  deposito: any | null;
  cantidad: number;
  importePrecio: number;
  porcDescuento: number;
  porcIva: number;   // 0, 5 o 10
}

@Component({
  selector: 'app-compras-nueva',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compras-nueva.component.html',
  styleUrl: './compras-nueva.component.css',
})
export class ComprasNuevaComponent implements OnInit {
  private readonly auth      = inject(AuthService);
  private readonly svc       = inject(ComprasService);
  private readonly provSvc   = inject(ProveedorService);
  private readonly depSvc    = inject(DepositoService);
  private readonly prodSvc   = inject(ProductoService);
  private readonly umSvc     = inject(UnidadMedidaService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);
  private _nextId            = 1;

  guardando = signal(false);

  // ── Maestros ───────────────────────────────────────────────
  proveedores   = signal<any[]>([]);
  depositos     = signal<any[]>([]);
  unidades      = signal<any[]>([]);

  // ── Cabecera ───────────────────────────────────────────────
  selProveedor     = signal<any>(null);
  fechaCompra      = signal(this._today());
  tipoComprobante  = signal('FACTURA');
  nroComprobante   = signal('');
  timbrado         = signal('');
  inicioTimbrado   = signal('');
  finTimbrado      = signal('');
  fechaVencimiento = signal('');

  // ── Líneas ─────────────────────────────────────────────────
  lineas = signal<LineaCompra[]>([]);

  // ── Totales calculados ─────────────────────────────────────
  totalIva5    = computed(() => this.lineas().reduce((s, l) => s + this._iva(l), 0));
  totalIva10   = computed(() => this.lineas().reduce((s, l) => s + this._iva10(l), 0));
  totalExenta  = computed(() => this.lineas().reduce((s, l) => s + this._exenta(l), 0));
  totalNeto    = computed(() => this.lineas().reduce((s, l) => s + this._neto(l), 0));
  totalImporte = computed(() => this.lineas().reduce((s, l) => s + this._total(l), 0));

  readonly tipoComprobanteOpts = ['FACTURA', 'NOTA_DE_CREDITO', 'RECIBO', 'TICKET'];
  readonly ivaOpts = [0, 5, 10];

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.provSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.proveedores.set(Array.isArray(r) ? r : (r.content ?? []))
    });
    this.depSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.depositos.set(Array.isArray(r) ? r : (r.content ?? []))
    });
    this.umSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.unidades.set(Array.isArray(r) ? r : (r.content ?? []))
    });
    this.agregarLinea();
  }

  buscarProveedores(q: string): void {
    if (!q || q.length < 2) return;
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.provSvc.getPage(0, q, codEmp).subscribe({
      next: (r: any) => this.proveedores.set(Array.isArray(r) ? r : (r.content ?? []))
    });
  }

  agregarLinea(): void {
    this.lineas.update(ls => [...ls, {
      _id: this._nextId++,
      producto: null, productos: [],
      unidadMedida: null, deposito: null,
      cantidad: 1, importePrecio: 0,
      porcDescuento: 0, porcIva: 10
    }]);
  }

  quitarLinea(idx: number): void {
    this.lineas.update(ls => ls.filter((_, i) => i !== idx));
  }

  buscarProductos(q: string, idx: number): void {
    if (!q || q.length < 2) return;
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.prodSvc.getPage(0, q, codEmp).subscribe({
      next: (r: any) => {
        this.lineas.update(ls => {
          const copy = [...ls];
          copy[idx] = { ...copy[idx], productos: Array.isArray(r) ? r : (r.content ?? []) };
          return copy;
        });
      }
    });
  }

  onProductoChange(prod: any, idx: number): void {
    this.lineas.update(ls => {
      const copy = [...ls];
      copy[idx] = {
        ...copy[idx],
        producto: prod,
        porcIva: prod?.porcIva ?? 10,
        unidadMedida: prod?.unidadMedida ?? null,
      };
      return copy;
    });
  }

  updateLinea(idx: number, campo: keyof LineaCompra, valor: any): void {
    this.lineas.update(ls => {
      const copy = [...ls];
      copy[idx] = { ...copy[idx], [campo]: valor };
      return copy;
    });
  }

  guardar(): void {
    if (!this.selProveedor())    { this.toast.error('Proveedor es obligatorio'); return; }
    if (!this.nroComprobante())  { this.toast.error('N° Comprobante es obligatorio'); return; }
    if (!this.timbrado())        { this.toast.error('Timbrado es obligatorio'); return; }
    if (this.lineas().length === 0) { this.toast.error('Debe agregar al menos un producto'); return; }
    if (this.lineas().some(l => !l.producto)) { this.toast.error('Todas las líneas deben tener producto'); return; }

    const sess = this.auth.session!;
    const compra: any = {
      codCompra: null,
      codEmpresa: sess.codEmpresa,
      codUsuarioCreacion: sess.codUsuario,
      anulado: false,
      estado: 'CONFIRMADO',
      proveedor: this.selProveedor(),
      fechaCompra: this.fechaCompra(),
      tipoComprobante: this.tipoComprobante(),
      nroComprobante: this.nroComprobante(),
      timbrado: this.timbrado(),
      inicioTimbrado: this.inicioTimbrado() || null,
      finTimbrado: this.finTimbrado() || null,
      fechaVencimiento: this.fechaVencimiento() || null,
      subTotal: this.totalNeto(),
      importeIva5: this.totalIva5(),
      importeIva10: this.totalIva10(),
      importeIvaExenta: this.totalExenta(),
      importeNeto: this.totalNeto(),
      importeTotal: this.totalImporte(),
      porcDescuento: 0,
      importeDescuento: 0,
      detalle: this.lineas().map((l, i) => ({
        codCompraDetalle: null,
        nroItem: i + 1,
        producto: l.producto,
        unidadMedida: l.unidadMedida,
        deposito: l.deposito,
        cantidad: l.cantidad,
        importePrecio: l.importePrecio,
        porcDescuento: l.porcDescuento,
        porcIva: l.porcIva,
        importeDescuento: this._descuento(l),
        subTotal: this._subtotalLinea(l),
        importeNeto: this._neto(l),
        importeIva5: l.porcIva === 5 ? this._iva(l) : 0,
        importeIva10: l.porcIva === 10 ? this._iva10(l) : 0,
        importeIvaExenta: l.porcIva === 0 ? this._total(l) : 0,
        importeTotal: this._total(l),
      })),
    };

    this.guardando.set(true);
    this.svc.create(compra).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success('Compra registrada correctamente');
        this.router.navigate(['/compras-lista']);
      },
      error: (e: any) => { this.guardando.set(false); this.toast.apiError(e); }
    });
  }

  cancelar(): void { this.router.navigate(['/compras-lista']); }

  // ── Helpers IVA (precio incluido) ─────────────────────────
  _subtotalLinea(l: LineaCompra): number {
    const bruto = l.importePrecio * l.cantidad;
    return bruto - (bruto * l.porcDescuento / 100);
  }
  _iva(l: LineaCompra): number {
    if (l.porcIva !== 5) return 0;
    return Math.round(this._subtotalLinea(l) / 21);
  }
  _iva10(l: LineaCompra): number {
    if (l.porcIva !== 10) return 0;
    return Math.round(this._subtotalLinea(l) / 11);
  }
  _exenta(l: LineaCompra): number {
    if (l.porcIva !== 0) return 0;
    return this._subtotalLinea(l);
  }
  _neto(l: LineaCompra): number {
    return this._subtotalLinea(l) - this._iva(l) - this._iva10(l);
  }
  _total(l: LineaCompra): number {
    return this._subtotalLinea(l);
  }
  _descuento(l: LineaCompra): number {
    return (l.importePrecio * l.cantidad) * l.porcDescuento / 100;
  }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
