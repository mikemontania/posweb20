import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }      from '../../core/services/auth.service';
import { InfluencerService } from '../../core/services/domain/influencer.service';
import { ToastService }     from '../../shared/components/toast/toast.service';
import { Influencer }       from '../../core/models/domain/influencer.model';

@Component({
  selector: 'app-influencers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './influencers.component.html',
  styleUrl: './influencers.component.css',
})
export class InfluencersComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(InfluencerService);
  private readonly toast = inject(ToastService);

  loading   = signal(false);
  items     = signal<Influencer[]>([]);
  showModal = signal(false);
  guardando = signal(false);

  form = signal<Partial<Influencer>>({});

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.svc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : (r.content ?? [])); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  nuevo(): void {
    this.form.set({ codEmpresa: this.auth.session?.codEmpresa ?? 1, activo: true, descuento: 0, cantSeguidores: 0, cantValidez: 1 });
    this.showModal.set(true);
  }

  editar(item: Influencer): void {
    this.form.set({ ...item });
    this.showModal.set(true);
  }

  guardar(): void {
    const f = this.form();
    if (!f.influencer || !f.cupon) { this.toast.error('Influencer y Código Cupón son requeridos'); return; }
    this.guardando.set(true);
    const payload = { ...f, cupon: f.cupon!.toUpperCase() } as Influencer;
    const op$ = f.codInfluencer
      ? this.svc.update(f.codInfluencer, payload)
      : this.svc.create(payload);
    op$.subscribe({
      next: () => {
        this.guardando.set(false); this.showModal.set(false);
        this.toast.success(f.codInfluencer ? 'Influencer actualizado' : 'Influencer creado');
        this.cargar();
      },
      error: (e: any) => { this.guardando.set(false); this.toast.apiError(e); }
    });
  }

  patch(key: keyof Influencer, val: any): void {
    this.form.update(f => ({ ...f, [key]: val }));
  }
}
