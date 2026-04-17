import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService }       from '../../core/services/auth.service';
import { CreditosService }   from '../../core/services/domain/creditos.service';
import { ClienteService }    from '../../core/services/domain/cliente.service';
import { ToastService }      from '../../shared/components/toast/toast.service';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-creditos-lista',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './creditos-lista.component.html',
  styleUrl: './creditos-lista.component.css',
})
export class CreditosListaComponent implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(CreditosService);
  private readonly cliSvc  = inject(ClienteService);
  private readonly toast   = inject(ToastService);

  // ── Lista paginada ─────────────────────────────────────
  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

  // ── Resumen (KPIs del servidor) ───────────────────────
  resumen = signal<any>(null);

  pageNumbers = computed(() => {
    const total = this.totalPages(), cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  // ── Filtros ────────────────────────────────────────────
  fechaDesde    = signal(this._today());
  fechaHasta    = signal(this._today());
  clientes      = signal<any[]>([]);
  selCliente    = signal<any>(null);
  nroComprobante = signal('');
  estado        = signal('TODOS');

  readonly estadoOpts = ['TODOS', 'PENDIENTE', 'PAGADO', 'VENCIDO'];

  ngOnInit(): void {
    this.buscar(0);
  }

  buscar(page = 0): void {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const vencido = this.estado() === 'VENCIDO';

    this.svc.buscarPaginado(
      this.fechaDesde(), this.fechaHasta(), codEmp,
      page, 20,
      this.selCliente()?.codCliente ?? undefined,
      this.nroComprobante() || undefined,
      this.estado(),
      vencido
    ).subscribe({
      next: (r: any) => {
        const list = Array.isArray(r) ? r : (r.content ?? []);
        this.items.set(list);
        this.totalElements.set(r.totalElements ?? list.length);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar créditos'); }
    });

    // Resumen KPIs
    this.svc.buscarResumen(this.fechaDesde(), this.fechaHasta(), codEmp)
      .subscribe({ next: (r: any) => this.resumen.set(r), error: () => {} });
  }

  limpiar(): void {
    this.fechaDesde.set(this._today()); this.fechaHasta.set(this._today());
    this.selCliente.set(null); this.nroComprobante.set(''); this.estado.set('TODOS');
    this.clientes.set([]);
    this.buscar(0);
  }

  buscarClientes(q: string): void {
    if (!q || q.length < 2) { this.clientes.set([]); return; }
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.cliSvc.getPage(0, q, codEmp).subscribe({
      next: (r: any) => this.clientes.set(Array.isArray(r) ? r : (r.content ?? [])),
      error: () => {}
    });
  }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.buscar(p); }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
