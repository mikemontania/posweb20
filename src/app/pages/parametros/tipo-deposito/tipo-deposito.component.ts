import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { TipoDepositoService } from '../../../core/services/domain/tipo-deposito.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { TipoDeposito } from '../../../core/models/domain/tipo-deposito.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({
  selector: 'app-tipo-deposito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tipo-deposito.component.html',
  styleUrl: './tipo-deposito.component.css',
})
export class TipoDepositoComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(TipoDepositoService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);

  items   = signal<TipoDeposito[]>([]);
  loading = signal(false);
  termino = '';

  showDelModal  = signal(false);
  itemAEliminar = signal<TipoDeposito | null>(null);
  eliminando    = signal(false);

  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): TipoDeposito[] {
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
      error: () => { this.loading.set(false); this.toast.error('Error al cargar Tipos de Depósito'); }
    });
  }

  solicitarEliminar(item: TipoDeposito): void {
    this.itemAEliminar.set(item); this.showDelModal.set(true);
  }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete((item as any).codTipoDeposito).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Tipos de Depósito eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
