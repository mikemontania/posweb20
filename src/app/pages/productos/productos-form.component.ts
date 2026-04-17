import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }       from '../../core/services/auth.service';
import { ProductoService }   from '../../core/services/domain/producto.service';
import { CategoriaService }  from '../../core/services/domain/categoria.service';
import { UnidadMedidaService }from '../../core/services/domain/unidad-medida.service';
import { ToastService }      from '../../shared/components/toast/toast.service';
import { SelectSearchComponent }  from '../../shared/components/select-search/select-search.component';
import { ImageUploadComponent }   from '../../shared/components/image-upload/image-upload.component';
import { ImagenPipe }             from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,
            SelectSearchComponent, ImageUploadComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productos-form.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosForm implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(ProductoService);
  private readonly catSvc  = inject(CategoriaService);
  private readonly uniSvc  = inject(UnidadMedidaService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly fb      = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  categorias = signal<any[]>([]);
  unidades   = signal<any[]>([]);

  selCategoria = signal<any>(null);
  selUnidad    = signal<any>(null);

  imgSrc       = signal<any>(null);   // Observable para el pipe imagen
  imagenFile   = signal<File | null>(null);

  readonly ivaOpts  = [0, 5, 10];
  readonly catsABC  = ['A', 'B', 'C'];

  form = this.fb.group({
    codProductoErp:  [''],
    nombreProducto:  ['', [Validators.required, Validators.minLength(3)]],
    descripcion:     [''],
    codBarra:        [''],
    marca:           [''],
    presentacion:    [''],
    color:           [''],
    grpMaterial:     [''],
    peso:            [0],
    iva:             [10],
    catABC:          ['B'],
    activo:          [true],
    sinDescuento:    [false],
    inventariable:   [true],
    ivaEspecial:     [false],
    obs:             [''],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.catSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.categorias.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.uniSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.unidades.set(Array.isArray(r) ? r : (r.content ?? [])) });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (p: any) => {
          this.form.patchValue({
            codProductoErp: p.codProductoErp ?? '',
            nombreProducto: p.nombreProducto ?? '',
            descripcion:    p.descripcion ?? '',
            codBarra:       p.codBarra ?? '',
            marca:          p.marca ?? '',
            presentacion:   p.presentacion ?? '',
            color:          p.color ?? '',
            grpMaterial:    p.grpMaterial ?? '',
            peso:           p.peso ?? 0,
            iva:            p.iva ?? 10,
            catABC:         p.catABC ?? 'B',
            activo:         p.activo ?? true,
            sinDescuento:   p.sinDescuento ?? false,
            inventariable:  p.inventariable ?? true,
            ivaEspecial:    p.ivaEspecial ?? false,
            obs:            p.obs ?? '',
          });
          this.selCategoria.set(p.categoriaProducto ?? null);
          this.selUnidad.set(p.unidad ?? null);
          if (p.img) {
            // Pasar el string de imagen para el pipe
            this.imgSrc.set(p.img);
          }
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    }
  }

  toUpper(field: string): void {
    const v = this.form.get(field)?.value;
    if (typeof v === 'string') this.form.get(field)?.setValue(v.toUpperCase(), { emitEvent: false });
  }

  hasError(field: string, error?: string): boolean {
    const c = this.form.get(field);
    if (!c || !c.touched) return false;
    return error ? c.hasError(error) : c.invalid;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);

    const payload: any = {
      ...this.form.value,
      codEmpresa:       this.auth.session?.codEmpresa ?? 1,
      categoriaProducto: this.selCategoria(),
      unidad:           this.selUnidad(),
    };

    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);

    op.subscribe({
      next: (p: any) => {
        const savedId = p?.codProducto ?? +id!;
        // Si hay imagen nueva, subirla
        if (this.imagenFile() && savedId) {
          this.svc.uploadImage(this.imagenFile()!, savedId).subscribe({
            next: () => { this.guardando.set(false); this.toast.success(id ? 'Producto actualizado' : 'Producto creado'); this.router.navigate(['/productos']); },
            error: () => { this.guardando.set(false); this.toast.success(id ? 'Producto actualizado (sin imagen)' : 'Producto creado (sin imagen)'); this.router.navigate(['/productos']); }
          });
        } else {
          this.guardando.set(false);
          this.toast.success(id ? 'Producto actualizado' : 'Producto creado');
          this.router.navigate(['/productos']);
        }
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
