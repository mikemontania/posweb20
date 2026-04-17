import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProveedorService } from '../../core/services/domain/proveedor.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-proveedores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proveedores-form.component.html',
  styleUrl: './proveedores.component.css',
})
export class ProveedoresForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(ProveedorService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  form = this.fb.group({
    codProveedorErp: [''],
    razonSocial:    ['', Validators.required],
    tipoDoc:        ['RUC', Validators.required],
    docNro:         ['', Validators.required],
    telefono:       [''],
    email:          ['', Validators.email],
    direccion:      [''],
    alias:          [''],
    obs:            [''],
    activo:         [true],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this._loadCatalogos(codEmp);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => {
          this.form.patchValue({
            codProveedorErp: r.codProveedorErp ?? '',
            razonSocial:     r.razonSocial ?? '',
            tipoDoc:         r.tipoDoc ?? 'RUC',
            docNro:          r.docNro ?? '',
            telefono:        r.telefono ?? '',
            email:           r.email ?? '',
            direccion:       r.direccion ?? '',
            alias:           r.alias ?? '',
            obs:             r.obs ?? '',
            activo:          r.activo ?? true,
          });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    }
  }

  _loadCatalogos(_codEmp: number): void {}

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
      codEmpresa: this.auth.session?.codEmpresa ?? 1,

    };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(id ? 'Proveedores actualizado' : 'Proveedores creado');
        this.router.navigate(['/proveedores']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
