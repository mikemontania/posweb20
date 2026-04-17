import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }        from '../../core/services/auth.service';
import { DescuentoService }   from '../../core/services/domain/descuento.service';
import { ListaPrecioService } from '../../core/services/domain/lista-precio.service';
import { ProductoService }    from '../../core/services/domain/producto.service';
import { SucursalService }    from '../../core/services/domain/sucursal.service';
import { MedioPagoService }   from '../../core/services/domain/medio-pago.service';
import { ToastService }       from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-descuentos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './descuentos-form.component.html',
  styleUrl: './descuentos.component.css',
})
export class DescuentosForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(DescuentoService);
  private readonly lpSvc  = inject(ListaPrecioService);
  private readonly prdSvc = inject(ProductoService);
  private readonly sucSvc = inject(SucursalService);
  private readonly mpSvc  = inject(MedioPagoService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  listasPrecios = signal<any[]>([]);
  productos     = signal<any[]>([]);
  sucursales    = signal<any[]>([]);
  mediosPago    = signal<any[]>([]);
  selListaPrecio = signal<any>(null);
  selProducto    = signal<any>(null);
  selSucursal    = signal<any>(null);
  selMedioPago   = signal<any>(null);

  form = this.fb.group({
    descripcion:     ['', Validators.required],
    codDescuentoErp: [''],
    tipoDescuento:   ['PORCENTAJE'],
    descuento:       [0, [Validators.required, Validators.min(0)]],
    cantDesde:       [1],
    cantHasta:       [999999999],
    fechaDesde:      [''],
    fechaHasta:      [''],
    activo:          [true],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.lpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.listasPrecios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.prdSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.productos.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.mpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.mediosPago.set(Array.isArray(r) ? r : (r.content ?? [])) });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => {
          this.form.patchValue({
            descripcion:     r.descripcion ?? '',
            codDescuentoErp: r.codDescuentoErp ?? '',
            tipoDescuento:   r.tipoDescuento ?? 'PORCENTAJE',
            descuento:       r.descuento ?? 0,
            cantDesde:       r.cantDesde ?? 1,
            cantHasta:       r.cantHasta ?? 999999999,
            fechaDesde:      r.fechaDesde ? r.fechaDesde.substring(0,10) : '',
            fechaHasta:      r.fechaHasta ? r.fechaHasta.substring(0,10) : '',
            activo:          r.activo ?? true,
          });
          this.selListaPrecio.set(r.listaPrecio ?? null);
          this.selProducto.set(r.producto ?? null);
          this.selMedioPago.set(r.medioPago ?? null);
          if (r.codSucursal) this.selSucursal.set({ codSucursal: r.codSucursal });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    }
  }

  toUpper(f: string): void {
    const v = this.form.get(f)?.value;
    if (typeof v === 'string') this.form.get(f)?.setValue(v.toUpperCase(), { emitEvent: false });
  }
  hasError(f: string, e?: string): boolean {
    const c = this.form.get(f);
    if (!c || !c.touched) return false;
    return e ? c.hasError(e) : c.invalid;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const payload: any = {
      ...this.form.value,
      codEmpresa:  this.auth.session?.codEmpresa ?? 1,
      listaPrecio: this.selListaPrecio(),
      producto:    this.selProducto(),
      medioPago:   this.selMedioPago(),
      codSucursal: this.selSucursal()?.codSucursal ?? null,
    };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: () => { this.guardando.set(false); this.toast.success(id ? 'Descuento actualizado' : 'Descuento creado'); this.router.navigate(['/descuentos']); },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
