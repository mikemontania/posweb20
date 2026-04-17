import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChoferService } from '../../core/services/domain/chofer.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-choferes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './choferes-form.component.html',
  styleUrl: './choferes.component.css',
})
export class ChoferesForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(ChoferService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  form = this.fb.group({
    codChoferErp: [''],
    chofer:       ['', Validators.required],
    docNro:       ['', Validators.required],
    tipoLicencia: ['PARTICULAR', Validators.required],
    licencia:     [''],
    activo:       [true],
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
            codChoferErp: r.codChoferErp ?? '',
            chofer:       r.chofer ?? '',
            docNro:       r.docNro ?? '',
            tipoLicencia: r.tipoLicencia ?? 'PARTICULAR',
            licencia:     r.licencia ?? '',
            activo:       r.activo ?? true,
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
        this.toast.success(id ? 'Choferes actualizado' : 'Choferes creado');
        this.router.navigate(['/choferes']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
