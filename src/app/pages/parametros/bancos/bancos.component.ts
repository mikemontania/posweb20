import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { BancosService } from '../../../core/services/domain/bancos.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { Bancos } from '../../../core/models/domain/bancos.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bancos.component.html',
  styleUrl: './bancos.component.css',
})
export class BancosComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(BancosService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);

  items   = signal<Bancos[]>([]);
  loading = signal(false);
  termino = '';

  showDelModal  = signal(false);
  itemAEliminar = signal<Bancos | null>(null);
  eliminando    = signal(false);

  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): Bancos[] {
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
      error: () => { this.loading.set(false); this.toast.error('Error al cargar Bancos'); }
    });
  }

  solicitarEliminar(item: Bancos): void {
    this.itemAEliminar.set(item); this.showDelModal.set(true);
  }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete((item as any).codBanco).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Bancos eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
