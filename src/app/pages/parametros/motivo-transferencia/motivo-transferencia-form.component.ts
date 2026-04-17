import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MotivoTransferenciaService } from '../../../core/services/domain/motivo-transferencia.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MotivoTransferencia } from '../../../core/models/domain/motivo-transferencia.model';

@Component({
  selector: 'app-motivo-transferencia-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './motivo-transferencia-form.component.html',
  styleUrl: './motivo-transferencia.component.css',
})
export class MotivoTransferenciaFormComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(MotivoTransferenciaService);
  private readonly toast  = inject(ToastService);
  private readonly route  = inject(ActivatedRoute);
  readonly router         = inject(Router);

  item      = signal<MotivoTransferencia>({} as MotivoTransferencia);
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
      this.item.set({ codEmpresa: codEmp } as MotivoTransferencia);
    }
    
  }

  guardar(): void {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion()
      ? this.svc.update((data as any).codMotivoTransferencia, data)
      : this.svc.create(data);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(this.esEdicion() ? 'Actualizado' : 'Creado');
        this.router.navigate(['/motivo-transferencia']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
