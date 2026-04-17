import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { CategoriaService } from '../../../core/services/domain/categoria.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { CategoriaProducto } from '../../../core/models/domain/categoria-producto.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css',
})
export class CategoriaComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(CategoriaService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);

  items   = signal<CategoriaProducto[]>([]);
  loading = signal(false);
  termino = '';

  showDelModal  = signal(false);
  itemAEliminar = signal<CategoriaProducto | null>(null);
  eliminando    = signal(false);

  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): CategoriaProducto[] {
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
      error: () => { this.loading.set(false); this.toast.error('Error al cargar Categorías de Producto'); }
    });
  }

  solicitarEliminar(item: CategoriaProducto): void {
    this.itemAEliminar.set(item); this.showDelModal.set(true);
  }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete((item as any).codCategoriaProducto).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Categorías de Producto eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
