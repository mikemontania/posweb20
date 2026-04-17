import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ListaPrecioService } from '../../../core/services/domain/lista-precio.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ListaPrecio } from '../../../core/models/domain/lista-precio.model';

@Component({
  selector: 'app-lista-precio-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lista-precio-form.component.html',
  styleUrl: './lista-precio.component.css',
})
export class ListaPrecioFormComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(ListaPrecioService);
  private readonly toast  = inject(ToastService);
  private readonly route  = inject(ActivatedRoute);
  readonly router         = inject(Router);

  item      = signal<ListaPrecio>({} as ListaPrecio);
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
      this.item.set({ codEmpresa: codEmp } as ListaPrecio);
    }
    
  }

  guardar(): void {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion()
      ? this.svc.update((data as any).codListaPrecio, data)
      : this.svc.create(data);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(this.esEdicion() ? 'Actualizado' : 'Creado');
        this.router.navigate(['/lista-precio']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
