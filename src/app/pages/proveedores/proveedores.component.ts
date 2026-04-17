import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProveedorService } from '../../core/services/domain/proveedor.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { DebounceSearchComponent } from '../../shared/components/debounce-search/debounce-search.component';


@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,
            ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css',
})
export class ProveedoresComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(ProveedorService);
  private readonly toast = inject(ToastService);

  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);
  termino       = signal('');

  pageNumbers = computed(() => {
    const total = this.totalPages(), cur = this.currentPage();
    if (total <= 7) return Array.from({length: total}, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur-1); i <= Math.min(total-2, cur+1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  showDelModal  = signal(false);
  itemAEliminar = signal<any>(null);
  eliminando    = signal(false);

  ngOnInit(): void { this.cargar(0); }

  cargar(page = 0): void {
    this.loading.set(true);
    this.svc.getPage(page, this.termino(), this.auth.session?.codEmpresa ?? 1).subscribe({
      next: (r: any) => {
        const raw: any[] = Array.isArray(r) ? r : (r.content ?? []);
        this.items.set(raw);
        this.totalElements.set(r.totalElements ?? raw.length);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  onSearch(t: string): void { this.termino.set(t); this.cargar(0); }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    if (p < 0 || p >= this.totalPages()) return;
    this.cargar(p);
  }

  solicitarEliminar(item: any): void { this.itemAEliminar.set(item); this.showDelModal.set(true); }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codProveedor).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Eliminado'); this.cargar(this.currentPage()); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
