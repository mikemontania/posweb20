import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoMaterialService } from '../../../core/services/domain/grupo-material.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { GrupoMaterial } from '../../../core/models/domain/grupo-material.model';

@Component({
  selector: 'app-grupo-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grupo-material-form.component.html',
  styleUrl: './grupo-material.component.css',
})
export class GrupoMaterialFormComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(GrupoMaterialService);
  private readonly toast  = inject(ToastService);
  private readonly route  = inject(ActivatedRoute);
  readonly router         = inject(Router);

  item      = signal<GrupoMaterial>({} as GrupoMaterial);
  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  get it(): any { return this.item() as any; }

  toUpper(v: string): string { return (v ?? '').toUpperCase(); }

  set(campo: string, valor: any): void {
    this.item.update(v => ({ ...v, [campo]: valor }));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => { this.item.set(r); this.loading.set(false); },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    } else {
      this.item.set({ codEmpresa: codEmp } as GrupoMaterial);
    }
    
  }

  guardar(): void {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion()
      ? this.svc.update((data as any).codGrupo, data)
      : this.svc.create(data);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(this.esEdicion() ? 'Actualizado' : 'Creado');
        this.router.navigate(['/grupo-material']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
