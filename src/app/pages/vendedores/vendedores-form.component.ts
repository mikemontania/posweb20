import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }     from '../../core/services/auth.service';
import { VendedorService } from '../../core/services/domain/vendedor.service';
import { UsuariosService } from '../../core/services/domain/usuarios.service';
import { ToastService }    from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-vendedores-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vendedores-form.component.html',
  styleUrl: './vendedores.component.css',
})
export class VendedoresForm implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(VendedorService);
  private readonly usSvc   = inject(UsuariosService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly fb      = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);
  usuarios  = signal<any[]>([]);
  selUsuario = signal<any>(null);

  form = this.fb.group({
    codVendedorErp:     [''],
    vendedor:           ['', Validators.required],
    docNro:             ['', Validators.required],
    telefono:           [''],
    email:              ['', Validators.email],
    direccion:          [''],
    porcentajeComision: [0],
    obs:                [''],
    activo:             [true],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.usSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.usuarios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => {
          this.form.patchValue({
            codVendedorErp:     r.codVendedorErp ?? '',
            vendedor:           r.vendedor ?? '',
            docNro:             r.docNro ?? '',
            telefono:           r.telefono ?? '',
            email:              r.email ?? '',
            direccion:          r.direccion ?? '',
            porcentajeComision: r.porcentajeComision ?? 0,
            obs:                r.obs ?? '',
            activo:             r.activo ?? true,
          });
          this.selUsuario.set(r.usuario ?? null);
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
    const payload: any = { ...this.form.value, codEmpresa: this.auth.session?.codEmpresa ?? 1, usuario: this.selUsuario() };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: () => { this.guardando.set(false); this.toast.success(id ? 'Vendedor actualizado' : 'Vendedor creado'); this.router.navigate(['/vendedores']); },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
