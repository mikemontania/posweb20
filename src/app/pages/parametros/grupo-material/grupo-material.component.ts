import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { GrupoMaterialService } from '../../../core/services/domain/grupo-material.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { GrupoMaterial } from '../../../core/models/domain/grupo-material.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({
  selector: 'app-grupo-material',
  standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grupo-material.component.html',
  styleUrl: './grupo-material.component.css',
})
export class GrupoMaterialComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(GrupoMaterialService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);

  items   = signal<GrupoMaterial[]>([]);
  loading = signal(false);
  termino = '';

  showDelModal  = signal(false);
  itemAEliminar = signal<GrupoMaterial | null>(null);
  eliminando    = signal(false);

  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): GrupoMaterial[] {
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
      error: () => { this.loading.set(false); this.toast.error('Error al cargar Grupos de Material'); }
    });
  }

  solicitarEliminar(item: GrupoMaterial): void {
    this.itemAEliminar.set(item); this.showDelModal.set(true);
  }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete((item as any).codGrupoMaterial).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Grupos de Material eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
