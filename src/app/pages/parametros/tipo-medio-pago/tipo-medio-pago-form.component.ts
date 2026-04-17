import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TipoMedioPagoService } from '../../../core/services/domain/tipo-medio-pago.service';
import { MedioPagoService } from '../../../core/services/domain/medio-pago.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TipoMedioPago } from '../../../core/models/domain/tipo-medio-pago.model';
import { MedioPago } from '../../../core/models/domain/medio-pago.model';

@Component({
  selector: 'app-tipo-medio-pago-form',
  standalone: true,
  imports: [FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tipo-medio-pago-form.component.html',
  styleUrl: './tipo-medio-pago.component.css',
})
export class TipoMedioPagoFormComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(TipoMedioPagoService);
  private readonly mpSvc  = inject(MedioPagoService);
  private readonly toast  = inject(ToastService);
  private readonly route  = inject(ActivatedRoute);
  readonly router         = inject(Router);

  item      = signal<TipoMedioPago>({} as TipoMedioPago);
  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);
  mediosPago = signal<MedioPago[]>([]);

  get it(): any { return this.item() as any; }
  toUpper(v: string): string { return (v ?? '').toUpperCase(); }
  set(campo: string, valor: any): void {
    this.item.update(v => ({ ...v, [campo]: valor }));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.mpSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.mediosPago.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => { this.item.set(r); this.loading.set(false); },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    } else {
      this.item.set({ codEmpresa: codEmp } as TipoMedioPago);
    }
  }

  setMedioPago(id: number): void {
   this.item.update(v => ({
  ...v,
  medioPago: this.mediosPago().find(m => m.codMedioPago === +id)!
}));
  
  }

  guardar(): void {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion()
      ? this.svc.update((data as any).codTipoMedioPago, data)
      : this.svc.create(data);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(this.esEdicion() ? 'Actualizado' : 'Creado');
        this.router.navigate(['/tipo-medio-pago']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
