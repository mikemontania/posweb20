import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PrecioMaterialService } from '../../core/services/domain/precio-material.service';
import { ProductoService } from '../../core/services/domain/producto.service';
import { SucursalService } from '../../core/services/domain/sucursal.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-precios-materiales',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterModule, ModalConfirmComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './precios-materiales.component.html',
  styleUrl: './precios-materiales.component.css',
})
export class PreciosMaterialesComponent implements OnInit {
  private readonly auth     = inject(AuthService);
  private readonly svc      = inject(PrecioMaterialService);
  private readonly prodSvc  = inject(ProductoService);
  private readonly sucSvc   = inject(SucursalService);
  private readonly toast    = inject(ToastService);

  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  // ── filtros ────────────────────────────────────────────────
  productos        = signal<any[]>([]);
  sucursales       = signal<any[]>([]);
  filtroProductoId = signal<number>(0);
  filtroSucursalId = signal<number>(0);

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
    this.prodSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.productos.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.cargar(0);
  }

  cargar(page = 0): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const extra: Record<string, any> = {};
    if (this.filtroProductoId()) extra['codproducto'] = this.filtroProductoId();
    if (this.filtroSucursalId()) extra['codsucursal'] = this.filtroSucursalId();
    this.svc.getPage(page, '', codEmp, extra).subscribe({
      next: (r: any) => {
        const raw: any[] = Array.isArray(r) ? r : (r.content ?? []);
        const mapped = raw.map((p: any) => ({
          ...p,
          _producto: p.producto?.nombreProducto ?? p.producto?.concatCodErpNombre ?? '—',
          _sucursal: p.sucursal?.nombreSucursal ?? '—',
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
  limpiar(): void { this.filtroProductoId.set(0); this.filtroSucursalId.set(0); this.cargar(0); }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    if (p < 0 || p >= this.totalPages()) return;
    this.cargar(p);
  }

  solicitarEliminar(item: any): void { this.itemAEliminar.set(item); this.showDelModal.set(true); }

  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codPrecioMaterial).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false);
        this.toast.success('Eliminado'); this.cargar(this.currentPage()); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}
