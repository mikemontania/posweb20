import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }   from '../../core/services/auth.service';
import { PremioService } from '../../core/services/domain/premio.service';
import { ToastService }  from '../../shared/components/toast/toast.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { ImagenPipe }           from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-premios-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ImageUploadComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './premios-form.component.html',
  styleUrl: './premios.component.css',
})
export class PremiosForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(PremioService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);
  imgSrc    = signal<any>(null);
  imagenFile = signal<File | null>(null);

  form = this.fb.group({
    codPremioErp:  [''],
    descripcion:   ['', [Validators.required, Validators.minLength(3)]],
    codBarra:      [''],
    puntos:        [0, [Validators.required, Validators.min(1)]],
    descuento:     [0],
    activo:        [true],
    inventariable: [false],
    obs:           [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (p: any) => {
          this.form.patchValue({
            codPremioErp:  p.codPremioErp ?? '',
            descripcion:   p.descripcion ?? '',
            codBarra:      p.codBarra ?? '',
            puntos:        p.puntos ?? 0,
            descuento:     p.descuento ?? 0,
            activo:        p.activo ?? true,
            inventariable: p.inventariable ?? false,
            obs:           p.obs ?? '',
          });
          if (p.img) this.imgSrc.set(p.img);
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
    const payload: any = { ...this.form.value, codEmpresa: this.auth.session?.codEmpresa ?? 1 };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: (p: any) => {
        const savedId = p?.codPremio ?? +id!;
        if (this.imagenFile() && savedId) {
          this.svc.uploadImage(this.imagenFile()!, savedId).subscribe({
            next: () => { this.guardando.set(false); this.toast.success(id ? 'Actualizado' : 'Creado'); this.router.navigate(['/premios']); },
            error: () => { this.guardando.set(false); this.toast.success('Guardado (sin imagen)'); this.router.navigate(['/premios']); }
          });
        } else {
          this.guardando.set(false);
          this.toast.success(id ? 'Premio actualizado' : 'Premio creado');
          this.router.navigate(['/premios']);
        }
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
