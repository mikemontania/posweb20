import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DescuentoService } from '../../core/services/domain/descuento.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { DebounceSearchComponent } from '../../shared/components/debounce-search/debounce-search.component';


@Component({
  selector: 'app-descuentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,
            ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './descuentos.component.html',
  styleUrl: './descuentos.component.css',
})
export class DescuentosComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(DescuentoService);
  private readonly toast = inject(ToastService);

  items          = signal<any[]>([]);
  loading        = signal(false);
  totalElements  = signal(0);
  totalPages     = signal(0);
  currentPage    = signal(0);
  readonly pageSize = 10;
  termino = signal('');

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({length: total}, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  showDelModal  = signal(false);
  itemAEliminar = signal<any>(null);
  eliminando    = signal(false);

  ngOnInit(): void { this.cargar(0); }

  cargar(page: number = 0): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.svc.getPage(page, this.termino(), codEmp).subscribe({
      next: (r: any) => {
        const raw: any[] = Array.isArray(r) ? r : (r.content ?? []);
        const mapped = raw.map((d: any) => ({
          ...d,
          _listaPrecio: d.listaPrecio?.descripcion ?? '—',
          _producto:    d.producto?.nombreProducto ?? '—',
          _sucursal:    d.sucursal?.nombreSucursal ?? '—',
        }));
        this.items.set(mapped);
        this.totalElements.set(r.totalElements ?? raw.length);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  onSearch(termino: string): void { this.termino.set(termino); this.cargar(0); }

  goToPage(page: number | '...'): void {
    if (typeof page !== 'number') return;
    if (page < 0 || page >= this.totalPages()) return;
    this.cargar(page);
  }

  solicitarEliminar(item: any): void { this.itemAEliminar.set(item); this.showDelModal.set(true); }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codDescuento).subscribe({
      next: () => {
        this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Eliminado correctamente');
        this.cargar(this.currentPage());
      },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
