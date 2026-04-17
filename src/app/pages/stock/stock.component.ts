import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StockService } from '../../core/services/domain/stock.service';
import { DepositoService } from '../../core/services/domain/deposito.service';
import { ProductoService } from '../../core/services/domain/producto.service';
import { UnidadMedidaService } from '../../core/services/domain/unidad-medida.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ImagenPipe } from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterModule, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
})
export class StockComponent implements OnInit {
  private readonly auth     = inject(AuthService);
  private readonly svc      = inject(StockService);
  private readonly depSvc   = inject(DepositoService);
  private readonly prodSvc  = inject(ProductoService);
  private readonly unidSvc  = inject(UnidadMedidaService);
  private readonly toast    = inject(ToastService);

  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  // ── filtros ────────────────────────────────────────────────
  depositos        = signal<any[]>([]);
  productos        = signal<any[]>([]);
  unidades         = signal<any[]>([]);
  filtroDepositoId = signal<number>(0);
  filtroProductoId = signal<number>(0);
  filtroUnidadId   = signal<number>(0);

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

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.depSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.depositos.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.prodSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.productos.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.unidSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.unidades.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    this.cargar(0);
  }

  cargar(page = 0): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const extra: Record<string, any> = {};
    if (this.filtroDepositoId()) extra['coddeposito'] = this.filtroDepositoId();
    if (this.filtroProductoId()) extra['codproducto'] = this.filtroProductoId();
    if (this.filtroUnidadId())   extra['codunidad']   = this.filtroUnidadId();
    this.svc.getPage(page, '', codEmp, extra).subscribe({
      next: (r: any) => {
        const raw: any[] = Array.isArray(r) ? r : (r.content ?? []);
        const mapped = raw.map((s: any) => ({
          ...s,
          _producto: s.producto?.nombreProducto ?? s.producto?.concatCodErpNombre ?? '—',
          _imgProd:  s.producto?.img ?? null,
          _deposito: s.deposito?.nombreDeposito ?? '—',
          _unidad:   s.unidad?.nombreUnidad ?? s.unidadMedida?.nombreUnidad ?? '—',
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
  limpiar(): void {
    this.filtroDepositoId.set(0);
    this.filtroProductoId.set(0);
    this.filtroUnidadId.set(0);
    this.cargar(0);
  }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    if (p < 0 || p >= this.totalPages()) return;
    this.cargar(p);
  }
}
