import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { MotivoAnulacionService } from '../../../core/services/domain/motivo-anulacion.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { MotivoAnulacion } from '../../../core/models/domain/motivo-anulacion.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({
  selector: 'app-motivo-anulacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './motivo-anulacion.component.html',
  styleUrl: './motivo-anulacion.component.css',
})
export class MotivoAnulacionComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(MotivoAnulacionService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);

  items   = signal<MotivoAnulacion[]>([]);
  loading = signal(false);
  termino = '';

  showDelModal  = signal(false);
  itemAEliminar = signal<MotivoAnulacion | null>(null);
  eliminando    = signal(false);

  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): MotivoAnulacion[] {
    const q = this.termino.toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(i => JSON.stringify(i).toLowerCase().includes(q));
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.svc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => {
        const rows = Array.isArray(r) ? r : (r.content ?? []);
        this.items.set(rows); this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar Motivos de Anulación'); }
    });
  }

  solicitarEliminar(item: MotivoAnulacion): void {
    this.itemAEliminar.set(item); this.showDelModal.set(true);
  }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete((item as any).codMotivoAnulacion).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Motivos de Anulación eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
