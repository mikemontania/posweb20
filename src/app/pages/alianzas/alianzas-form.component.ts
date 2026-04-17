import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlianzasService } from '../../core/services/domain/alianzas.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({ selector: 'app-alianzas-form', standalone: true,
  imports: [FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alianzas-form.component.html', styleUrl: './alianzas.component.css' })
export class AlianzasForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(AlianzasService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  item = signal<any>({}); loading = signal(false); guardando = signal(false); esEdicion = signal(false);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({ next: (r: any) => { this.item.set(r); this.loading.set(false); }, error: () => { this.loading.set(false); this.toast.error('Error al cargar'); } });
    } else { this.item.set({ codEmpresa: this.auth.session?.codEmpresa ?? 1 }); }
  }
  get it(): any { return this.item() as any; }

  toUpper(v: string): string { return (v ?? '').toUpperCase(); }
  set(campo: string, valor: any): void {
    this.item.update(v => ({ ...v, [campo]: valor }));
  }

    guardar(): void {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion() ? this.svc.update(data.codAlianza, data) : this.svc.create(data);
    op.subscribe({ next: () => { this.guardando.set(false); this.toast.success(this.esEdicion() ? 'Actualizado' : 'Creado'); this.router.navigate(['/alianzas']); },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); } });
  }
}