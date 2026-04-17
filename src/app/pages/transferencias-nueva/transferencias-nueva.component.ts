import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }              from '../../core/services/auth.service';
import { TransferenciaService }     from '../../core/services/domain/transferencia.service';
import { DepositoService }          from '../../core/services/domain/deposito.service';
import { MotivoTransferenciaService } from '../../core/services/domain/motivo-transferencia.service';
import { ProductoService }          from '../../core/services/domain/producto.service';
import { UnidadMedidaService }      from '../../core/services/domain/unidad-medida.service';
import { ToastService }             from '../../shared/components/toast/toast.service';
import { SelectSearchComponent }    from '../../shared/components/select-search/select-search.component';

interface LineaTransferencia {
  _id: number;
  producto: any | null;
  productos: any[];
  unidadMedida: any | null;
  cantidadTransferencia: number;
}

@Component({
  selector: 'app-transferencias-nueva',
  standalone: true,
  imports: [FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transferencias-nueva.component.html',
  styleUrl: './transferencias-nueva.component.css',
})
export class TransferenciasNuevaComponent implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly svc        = inject(TransferenciaService);
  private readonly depSvc     = inject(DepositoService);
  private readonly motivoSvc  = inject(MotivoTransferenciaService);
  private readonly prodSvc    = inject(ProductoService);
  private readonly umSvc      = inject(UnidadMedidaService);
  private readonly toast      = inject(ToastService);
  private readonly router     = inject(Router);
  private _nextId             = 1;

  guardando = signal(false);

  // ── Maestros ───────────────────────────────────────────────
  depositos = signal<any[]>([]);
  motivos   = signal<any[]>([]);
  unidades  = signal<any[]>([]);

  // ── Cabecera ───────────────────────────────────────────────
  fecha          = signal(this._today());
  nroComprobante = signal('');
  selEmisor      = signal<any>(null);
  selReceptor    = signal<any>(null);
  selMotivo      = signal<any>(null);

  // ── Líneas ─────────────────────────────────────────────────
  lineas = signal<LineaTransferencia[]>([]);

  totalProducto = computed(() => this.lineas().length);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.depSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.depositos.set(Array.isArray(r) ? r : (r.content ?? []))
    });
    this.motivoSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.motivos.set(Array.isArray(r) ? r : [])
    });
    this.umSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.unidades.set(Array.isArray(r) ? r : (r.content ?? []))
    });
    this.agregarLinea();
  }

  agregarLinea(): void {
    this.lineas.update(ls => [...ls, {
      _id: this._nextId++,
      producto: null, productos: [],
      unidadMedida: null,
      cantidadTransferencia: 1,
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
      copy[idx] = { ...copy[idx], producto: prod, unidadMedida: prod?.unidadMedida ?? null };
      return copy;
    });
  }

  updateLinea(idx: number, campo: keyof LineaTransferencia, valor: any): void {
    this.lineas.update(ls => {
      const copy = [...ls];
      copy[idx] = { ...copy[idx], [campo]: valor };
      return copy;
    });
  }

  guardar(): void {
    if (!this.selEmisor())    { this.toast.error('Depósito emisor es obligatorio'); return; }
    if (!this.selReceptor())  { this.toast.error('Depósito receptor es obligatorio'); return; }
    if (this.selEmisor()?.codDeposito === this.selReceptor()?.codDeposito) {
      this.toast.error('El depósito emisor y receptor no pueden ser el mismo'); return;
    }
    if (!this.selMotivo())    { this.toast.error('Motivo de transferencia es obligatorio'); return; }
    if (this.lineas().length === 0) { this.toast.error('Debe agregar al menos un producto'); return; }
    if (this.lineas().some(l => !l.producto)) { this.toast.error('Todas las líneas deben tener producto'); return; }

    const sess = this.auth.session!;
    const transferencia: any = {
      codTransferencia: null,
      codEmpresa: sess.codEmpresa,
      codUsuarioCreacion: sess.codUsuario,
      usuario: sess.username,
      anulado: false,
      fecha: this.fecha(),
      nroComprobante: this.nroComprobante() || null,
      depositoEmisor: this.selEmisor(),
      depositoReceptor: this.selReceptor(),
      motivoTransferencia: this.selMotivo(),
      totalProducto: this.totalProducto(),
      totalTransferencia: this.lineas().reduce((s, l) => s + l.cantidadTransferencia, 0),
      detalle: this.lineas().map((l, i) => ({
        codTransferenciaDetalle: null,
        nroItem: i + 1,
        producto: l.producto,
        unidadMedida: l.unidadMedida,
        cantidadTransferencia: l.cantidadTransferencia,
      })),
    };

    this.guardando.set(true);
    this.svc.create(transferencia).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success('Transferencia creada correctamente');
        this.router.navigate(['/transferencias-lista']);
      },
      error: (e: any) => { this.guardando.set(false); this.toast.apiError(e); }
    });
  }

  cancelar(): void { this.router.navigate(['/transferencias-lista']); }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
