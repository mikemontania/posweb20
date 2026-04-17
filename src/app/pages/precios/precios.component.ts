import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PrecioService } from '../../core/services/domain/precio.service';
import { ListaPrecioService } from '../../core/services/domain/lista-precio.service';
import { ProductoService } from '../../core/services/domain/producto.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { ImagenPipe } from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-precios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,
            ModalConfirmComponent, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './precios.component.html',
  styleUrl: './precios.component.css',
})
export class PreciosComponent implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(PrecioService);
  private readonly lpSvc   = inject(ListaPrecioService);
  private readonly prodSvc = inject(ProductoService);
  private readonly toast   = inject(ToastService);

  // ── lista ──────────────────────────────────────────────────
  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  // ── filtros ────────────────────────────────────────────────
  listasPrecios  = signal<any[]>([]);
  productos      = signal<any[]>([]);
  filtroListaId  = signal<number>(0);
  filtroProductoId = signal<number>(0);

  // ── paginación visual ──────────────────────────────────────
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

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.lpSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.listasPrecios.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.prodSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.productos.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.cargar(0);
  }

  cargar(page = 0): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const extra: Record<string, any> = {};
    if (this.filtroListaId())    extra['codlistaprecio']  = this.filtroListaId();
    if (this.filtroProductoId()) extra['codproducto']     = this.filtroProductoId();
    this.svc.getPage(page, '', codEmp, extra).subscribe({
      next: (r: any) => {
        const raw: any[] = Array.isArray(r) ? r : (r.content ?? []);
        const mapped = raw.map((p: any) => ({
          ...p,
          _producto:    p.producto?.nombreProducto ?? p.producto?.concatCodErpNombre ?? '—',
          _imgProducto: p.producto?.img ?? null,
          _listaPrecio: p.listaPrecio?.descripcion ?? '—',
          _tipoPrecio:  p.tipoPrecio?.descripcion ?? '—',
          _unidad:      p.unidadMedida?.nombreUnidad ?? '—',
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

  buscar(): void { this.cargar(0); }
  limpiar(): void { this.filtroListaId.set(0); this.filtroProductoId.set(0); this.cargar(0); }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    if (p < 0 || p >= this.totalPages()) return;
    this.cargar(p);
  }

  solicitarEliminar(item: any): void { this.itemAEliminar.set(item); this.showDelModal.set(true); }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codPrecio).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Eliminado'); this.cargar(this.currentPage()); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
