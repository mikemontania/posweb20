import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }           from '../../core/services/auth.service';
import { PrecioMaterialService } from '../../core/services/domain/precio-material.service';
import { ProductoService }       from '../../core/services/domain/producto.service';
import { SucursalService }       from '../../core/services/domain/sucursal.service';
import { ToastService }          from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-precios-materiales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './precios-materiales-form.component.html',
  styleUrl: './precios-materiales.component.css',
})
export class PreciosMaterialesForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(PrecioMaterialService);
  private readonly prdSvc = inject(ProductoService);
  private readonly sucSvc = inject(SucursalService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  productos  = signal<any[]>([]);
  sucursales = signal<any[]>([]);
  selProducto = signal<any>(null);
  selSucursal = signal<any>(null);

  form = this.fb.group({
    precioCosto: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.prdSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.productos.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r:any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => {
          this.form.patchValue({ precioCosto: r.precioCosto ?? 0 });
          this.selProducto.set(r.producto ?? null);
          this.selSucursal.set(r.sucursal ?? null);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    }
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
      codEmpresa: this.auth.session?.codEmpresa ?? 1,
      producto:   this.selProducto(),
      sucursal:   this.selSucursal(),
    };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: () => { this.guardando.set(false); this.toast.success(id ? 'Actualizado' : 'Creado'); this.router.navigate(['/precios-materiales']); },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
