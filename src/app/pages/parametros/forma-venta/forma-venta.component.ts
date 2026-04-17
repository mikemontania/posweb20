import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }      from '../../../core/services/auth.service';
import { FormaVentaService } from '../../../core/services/domain/forma-venta.service';
import { ToastService }     from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { FormaVenta } from '../../../core/models/domain/forma-venta.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({ selector: 'app-forma-venta', standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forma-venta.component.html', styleUrl: './forma-venta.component.css' })
export class FormaVentaComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(FormaVentaService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);

  items   = signal<FormaVenta[]>([]);
  loading = signal(false);
  termino = '';
  showDelModal  = signal(false);
  itemAEliminar = signal<FormaVenta | null>(null);
  eliminando    = signal(false);

  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): FormaVenta[] {
    const q = this.termino.toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(i => JSON.stringify(i).toLowerCase().includes(q));
  }

  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.loading.set(true);
    this.svc.getAll({ codempresa: this.auth.session?.codEmpresa ?? 1 }).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : (r.content ?? [])); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }
  solicitarEliminar(item: FormaVenta): void { this.itemAEliminar.set(item); this.showDelModal.set(true); }
  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codFormaVenta).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false); this.toast.success('Eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
