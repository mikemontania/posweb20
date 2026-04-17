import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService }      from '../../core/services/auth.service';
import { RepartoService }   from '../../core/services/domain/reparto.service';
import { SucursalService }  from '../../core/services/domain/sucursal.service';
import { ChoferService }    from '../../core/services/domain/chofer.service';
import { VehiculoService }  from '../../core/services/domain/vehiculo.service';
import { VentasService }    from '../../core/services/domain/ventas.service';
import { PedidosService }   from '../../core/services/domain/pedidos.service';
import { ToastService }     from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

type Modo = 'REPARTO' | 'PEDIDOS' | 'VENTAS';

@Component({
  selector: 'app-repartos',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './repartos.component.html',
  styleUrl: './repartos.component.css',
})
export class RepartosComponent implements OnInit {
  private readonly auth      = inject(AuthService);
  private readonly svc       = inject(RepartoService);
  private readonly sucSvc    = inject(SucursalService);
  private readonly choferSvc = inject(ChoferService);
  private readonly vehSvc    = inject(VehiculoService);
  private readonly ventasSvc = inject(VentasService);
  private readonly pedidosSvc = inject(PedidosService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);

  modo         = signal<Modo>('REPARTO');
  guardando    = signal(false);
  cargandoDocs = signal(false);

  // Maestros
  sucursales   = signal<any[]>([]);
  choferes     = signal<any[]>([]);
  vehiculos    = signal<any[]>([]);

  // Cabecera
  fechaReparto   = signal(this._today());
  selSucursal    = signal<any>(null);
  selChofer      = signal<any>(null);
  selAyudante1   = signal<any>(null);
  selAyudante2   = signal<any>(null);
  selVehiculo    = signal<any>(null);
  obs            = signal('');

  // Docs / detalles del reparto
  repartoDocs    = signal<any[]>([]);
  repartoDetalle = signal<any[]>([]);
  totalGs        = computed(() => this.repartoDocs().reduce((s, d) => s + (d.totalGs ?? 0), 0));
  totalKg        = computed(() => this.repartoDocs().reduce((s, d) => s + (d.totalKg ?? 0), 0));

  // Sub-listado: Pedidos
  fechaDesdePed  = signal(this._today());
  fechaHastaPed  = signal(this._today());
  listaPedidos   = signal<any[]>([]);
  totalPed       = signal(0);
  pagePed        = signal(0);
  totalPagesPed  = signal(0);

  // Sub-listado: Ventas
  fechaDesdeV    = signal(this._today());
  fechaHastaV    = signal(this._today());
  listaVentas    = signal<any[]>([]);
  totalV         = signal(0);
  pageV          = signal(0);
  totalPagesV    = signal(0);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;

    this.sucSvc.getAll({ codempresa: codEmp })
      .subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.choferSvc.getAll({ codempresa: codEmp })
      .subscribe({ next: (r: any) => this.choferes.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.vehSvc.getAll({ codempresa: codEmp })
      .subscribe({ next: (r: any) => this.vehiculos.set(Array.isArray(r) ? r : (r.content ?? [])) });

    if (codSuc > 0) {
      this.sucSvc.getById(codSuc).subscribe({ next: (s: any) => this.selSucursal.set(s) });
    }
  }

  // ── Modos ─────────────────────────────────────────────────
  irPedidos(): void {
    this.modo.set('PEDIDOS');
    this.buscarPedidos(0);
  }

  irVentas(): void {
    this.modo.set('VENTAS');
    this.buscarVentas(0);
  }

  irReparto(): void { this.modo.set('REPARTO'); }

  // ── Pedidos ───────────────────────────────────────────────
  buscarPedidos(page: number): void {
    this.cargandoDocs.set(true);
    const codSuc = this.selSucursal()?.codSucursal ?? 0;
    this.pedidosSvc.findByFecha(
      page, this.fechaDesdePed(), this.fechaHastaPed(),
      null, null, codSuc, 20, 'PENDIENTE', false, '', 0
    ).subscribe({
      next: (r: any) => {
        this.listaPedidos.set(r.content ?? []);
        this.totalPed.set(r.totalElements ?? 0);
        this.pagePed.set(r.number ?? page);
        this.totalPagesPed.set(r.totalPages ?? 1);
        this.cargandoDocs.set(false);
      },
      error: () => { this.cargandoDocs.set(false); this.toast.error('Error al cargar pedidos'); }
    });
  }

  agregarPedido(pedido: any): void {
    if (pedido.codReparto != null) { this.toast.error('El pedido ya tiene un reparto asignado'); return; }
    if (this.repartoDocs().some(d => d.pedido?.codPedido === pedido.codPedido)) {
      this.toast.error('El pedido ya está en el reparto'); return;
    }
    this.pedidosSvc.getById(pedido.codPedido).subscribe({
      next: (full: any) => {
        const p: any = full.pedido ?? full;
        const detalles: any[] = p.detalle ?? [];
        this._mergeDetalles(detalles, p.importeTotal ?? 0);
        this.repartoDocs.update(docs => [...docs, {
          pedido: p, venta: null, cliente: p.cliente,
          tipo: 'PEDIDO', docNro: String(p.nroPedido ?? ''),
          totalGs: p.importeTotal ?? 0,
          totalKg: detalles.reduce((s: number, d: any) => s + (d.producto?.peso ?? 0), 0),
          latitud: p.cliente?.latitud ?? 0, longitud: p.cliente?.longitud ?? 0,
        }]);
        this.toast.success('Pedido agregado');
      },
      error: (e: any) => this.toast.apiError(e)
    });
  }

  // ── Ventas ────────────────────────────────────────────────
  buscarVentas(page: number): void {
    this.cargandoDocs.set(true);
    const codSuc = this.selSucursal()?.codSucursal;
    const sucObj = codSuc ? { codSucursal: codSuc } as any : null;
    this.ventasSvc.findByFecha(
      page, this.fechaDesdeV(), this.fechaHastaV(),
      null, null, sucObj, '', '', '', 20, false
    ).subscribe({
      next: (r: any) => {
        this.listaVentas.set(r.content ?? []);
        this.totalV.set(r.totalElements ?? 0);
        this.pageV.set(r.number ?? page);
        this.totalPagesV.set(r.totalPages ?? 1);
        this.cargandoDocs.set(false);
      },
      error: () => { this.cargandoDocs.set(false); this.toast.error('Error al cargar ventas'); }
    });
  }

  agregarVenta(venta: any): void {
    if (venta.codReparto != null) { this.toast.error('La venta ya tiene un reparto asignado'); return; }
    if (this.repartoDocs().some(d => d.venta?.codVenta === venta.codVenta)) {
      this.toast.error('La venta ya está en el reparto'); return;
    }
    this.ventasSvc.getById(venta.codVenta).subscribe({
      next: (full: any) => {
        const v: any = full.venta ?? full;
        const detalles: any[] = v.detalle ?? [];
        this._mergeDetalles(detalles, v.importeTotal ?? 0);
        this.repartoDocs.update(docs => [...docs, {
          venta: v, pedido: null, cliente: v.cliente,
          tipo: 'VENTA', docNro: v.nroComprobante ?? '',
          totalGs: v.importeTotal ?? 0,
          totalKg: detalles.reduce((s: number, d: any) => s + (d.producto?.peso ?? 0), 0),
          latitud: v.cliente?.latitud ?? 0, longitud: v.cliente?.longitud ?? 0,
        }]);
        this.toast.success('Venta agregada');
      },
      error: (e: any) => this.toast.apiError(e)
    });
  }

  // ── Quitar doc ────────────────────────────────────────────
  quitarDoc(idx: number): void {
    const doc = this.repartoDocs()[idx];
    const detalles: any[] = doc.venta?.detalle ?? doc.pedido?.detalle ?? [];
    // Restar detalles del resumen
    const current = [...this.repartoDetalle()];
    for (const det of detalles) {
      const i = current.findIndex(d => d.producto?.codProducto === det.producto?.codProducto);
      if (i !== -1) {
        current[i] = { ...current[i], cantidad: current[i].cantidad - det.cantidad };
        if (current[i].cantidad <= 0) current.splice(i, 1);
      }
    }
    this.repartoDetalle.set(current);
    this.repartoDocs.update(docs => docs.filter((_, i) => i !== idx));
  }

  // ── Guardar ───────────────────────────────────────────────
  guardar(): void {
    if (!this.selChofer())   { this.toast.error('Chofer es obligatorio'); return; }
    if (!this.selVehiculo()) { this.toast.error('Vehículo es obligatorio'); return; }
    if (!this.fechaReparto()) { this.toast.error('La fecha es obligatoria'); return; }
    if (this.repartoDocs().length === 0) { this.toast.error('Debe agregar al menos un documento'); return; }

    const sess = this.auth.session!;
    const reparto: any = {
      codReparto: null,
      codEmpresa: sess.codEmpresa,
      codSucursal: this.selSucursal()?.codSucursal ?? sess.codSucursal,
      anulado: false,
      chofer:     this.selChofer(),
      ayudante1:  this.selAyudante1() ?? null,
      ayudante2:  this.selAyudante2() ?? null,
      vehiculo:   this.selVehiculo(),
      codUsuarioCreacion: sess.codUsuario,
      usuarioCreacion: sess.username,
      usuarioModificacion: sess.username,
      fechaReparto: this.fechaReparto(),
      totalKg: this.totalKg(),
      totalGs: this.totalGs(),
      obs: this.obs(),
      documento: this.repartoDocs(),
      detalle:   this.repartoDetalle(),
    };

    this.guardando.set(true);
    this.svc.create(reparto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success('Reparto creado correctamente');
        this.router.navigate(['/reparto-lista']);
      },
      error: (e: any) => { this.guardando.set(false); this.toast.apiError(e); }
    });
  }

  cancelar(): void { this.router.navigate(['/reparto-lista']); }

  // ── Verificar choferes duplicados ─────────────────────────
  onChoferChange(item: any, rol: 'chofer' | 'ay1' | 'ay2'): void {
    const all = [
      { s: this.selChofer,    r: 'chofer' },
      { s: this.selAyudante1, r: 'ay1'   },
      { s: this.selAyudante2, r: 'ay2'   },
    ].filter(x => x.r !== rol).map(x => x.s()?.codChofer).filter(Boolean);

    if (item && all.includes(item.codChofer)) {
      this.toast.error(`${item.chofer} ya fue seleccionado en otro rol`);
      if (rol === 'chofer')   this.selChofer.set(null);
      if (rol === 'ay1')      this.selAyudante1.set(null);
      if (rol === 'ay2')      this.selAyudante2.set(null);
      return;
    }
    if (rol === 'chofer')   this.selChofer.set(item);
    if (rol === 'ay1')      this.selAyudante1.set(item);
    if (rol === 'ay2')      this.selAyudante2.set(item);
  }

  pedidoEnReparto(codPedido: number): boolean {
    return this.repartoDocs().some(d => d.pedido?.codPedido === codPedido);
  }

  ventaEnReparto(codVenta: number): boolean {
    return this.repartoDocs().some(d => d.venta?.codVenta === codVenta);
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }

  private _today(): string { return new Date().toISOString().slice(0, 10); }

  private _mergeDetalles(detalles: any[], _totalGs: number): void {
    const current = [...this.repartoDetalle()];
    for (const det of detalles) {
      const i = current.findIndex(d => d.producto?.codProducto === det.producto?.codProducto);
      if (i === -1) {
        current.push({
          codRepartoDetalle: null,
          producto: det.producto,
          unidadMedida: det.unidadMedida,
          cantidadUnidad: det.unidadMedida?.cantidad ?? 1,
          cantidad: det.cantidad,
          totalGs: det.importeTotal ?? 0,
          totalKg: det.producto?.peso ?? 0,
        });
      } else {
        current[i] = {
          ...current[i],
          cantidad: current[i].cantidad + det.cantidad,
          totalGs:  current[i].totalGs  + (det.importeTotal ?? 0),
        };
      }
    }
    this.repartoDetalle.set(current);
  }
}
