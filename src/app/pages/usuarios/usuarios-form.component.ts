import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }      from '../../core/services/auth.service';
import { UsuariosService }  from '../../core/services/domain/usuarios.service';
import { RolService }       from '../../core/services/domain/rol.service';
import { SucursalService }  from '../../core/services/domain/sucursal.service';
import { ToastService }     from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';
import { ImageUploadComponent }  from '../../shared/components/image-upload/image-upload.component';
import { ImagenPipe }            from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,
            SelectSearchComponent, ImageUploadComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usuarios-form.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosForm implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(UsuariosService);
  private readonly rolSvc  = inject(RolService);
  private readonly sucSvc  = inject(SucursalService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly fb      = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  roles      = signal<any[]>([]);
  sucursales = signal<any[]>([]);
  selRol      = signal<any>(null);
  selSucursal = signal<any>(null);
  imgSrc      = signal<any>(null);
  imagenFile  = signal<File | null>(null);

  form = this.fb.group({
    nombrePersona:  ['', Validators.required],
    username:       ['', [Validators.required, Validators.email]],
    password:       [''],
    codPersonaErp:  [''],
    enabled:        [true],
    bloqueado:      [false],
  });

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.rolSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.roles.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      // En edición password no es requerida
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (u: any) => {
          this.form.patchValue({
            nombrePersona: u.nombrePersona ?? '',
            username:      u.username ?? '',
            codPersonaErp: u.codPersonaErp ?? '',
            enabled:       u.enabled ?? true,
            bloqueado:     u.bloqueado ?? false,
          });
          this.selRol.set(u.rol ?? null);
          this.selSucursal.set(u.sucursal ?? null);
          if (u.img) this.imgSrc.set(u.img);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
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
    const v = this.form.value;
    const payload: any = {
      ...v,
      codEmpresa: this.auth.session?.codEmpresa ?? 1,
      rol:        this.selRol(),
      sucursal:   this.selSucursal(),
    };
    if (!v.password) delete payload.password;

    const id = this.route.snapshot.paramMap.get('id');
    const op = id ? this.svc.update(+id, payload) : this.svc.create(payload);
    op.subscribe({
      next: (u: any) => {
        const savedId = u?.codUsuario ?? +id!;
        if (this.imagenFile() && savedId) {
          this.svc.uploadImage(this.imagenFile()!, savedId).subscribe({
            next: () => { this.guardando.set(false); this.toast.success(id ? 'Usuario actualizado' : 'Usuario creado'); this.router.navigate(['/usuarios']); },
            error: () => { this.guardando.set(false); this.toast.success('Guardado (sin imagen)'); this.router.navigate(['/usuarios']); }
          });
        } else {
          this.guardando.set(false);
          this.toast.success(id ? 'Usuario actualizado' : 'Usuario creado');
          this.router.navigate(['/usuarios']);
        }
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
