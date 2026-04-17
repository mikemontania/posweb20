import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }        from '../../core/services/auth.service';
import { PrecioService }      from '../../core/services/domain/precio.service';
import { ListaPrecioService } from '../../core/services/domain/lista-precio.service';
import { ProductoService }    from '../../core/services/domain/producto.service';
import { TipoPrecioService }  from '../../core/services/domain/tipo-precio.service';
import { UnidadMedidaService }from '../../core/services/domain/unidad-medida.service';
import { ToastService }       from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-precios-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './precios-form.component.html',
  styleUrl: './precios.component.css',
})
export class PreciosForm implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(PrecioService);
  private readonly lpSvc   = inject(ListaPrecioService);
  private readonly prdSvc  = inject(ProductoService);
  private readonly tpSvc   = inject(TipoPrecioService);
  private readonly uniSvc  = inject(UnidadMedidaService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly fb      = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  listasPrecios = signal<any[]>([]);
  productos     = signal<any[]>([]);
  tiposPrecios  = signal<any[]>([]);
  unidades      = signal<any[]>([]);

  selListaPrecio = signal<any>(null);
  selProducto    = signal<any>(null);
  selTipoPrecio  = signal<any>(null);
  selUnidad      = signal<any>(null);

  form = this.fb.group({
    codPrecioErp: [''],
    precio:       [0, [Validators.required, Validators.min(0)]],
    cantDesde:    [1],
    cantHasta:    [999999999],
    fechaDesde:   [''],
    fechaHasta:   [''],
    activo:       [true],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.lpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.listasPrecios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.prdSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.productos.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.tpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.tiposPrecios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.uniSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.unidades.set(Array.isArray(r) ? r : (r.content ?? [])) });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => {
          this.form.patchValue({
            codPrecioErp: r.codPrecioErp ?? '',
            precio:       r.precio ?? 0,
            cantDesde:    r.cantDesde ?? 1,
            cantHasta:    r.cantHasta ?? 999999999,
            fechaDesde:   r.fechaDesde ? String(r.fechaDesde).substring(0,10) : '',
            fechaHasta:   r.fechaHasta ? String(r.fechaHasta).substring(0,10) : '',
            activo:       r.activo ?? true,
          });
          this.selListaPrecio.set(r.listaPrecio ?? null);
          this.selProducto.set(r.producto ?? null);
          this.selTipoPrecio.set(r.tipoPrecio ?? null);
          this.selUnidad.set(r.unidadMedida ?? null);
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
      codEmpresa:   this.auth.session?.codEmpresa ?? 1,
      listaPrecio:  this.selListaPrecio(),
      producto:     this.selProducto(),
      tipoPrecio:   this.selTipoPrecio(),
      unidadMedida: this.selUnidad(),
    };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: () => { this.guardando.set(false); this.toast.success(id ? 'Precio actualizado' : 'Precio creado'); this.router.navigate(['/precios']); },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
