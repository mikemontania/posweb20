import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }             from '../../core/services/auth.service';
import { HistorialPuntoService }   from '../../core/services/domain/historial-puntos.service';
import { ClienteService }          from '../../core/services/domain/cliente.service';
import { ToastService }            from '../../shared/components/toast/toast.service';
import { SelectSearchComponent }   from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-historial-puntos',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historial-puntos.component.html',
  styleUrl: './historial-puntos.component.css',
})
export class HistorialPuntosComponent implements OnInit {
  private readonly auth     = inject(AuthService);
  private readonly svc      = inject(HistorialPuntoService);
  private readonly cliSvc   = inject(ClienteService);
  private readonly toast    = inject(ToastService);

  loading    = signal(false);
  items      = signal<any[]>([]);
  clientes   = signal<any[]>([]);
  selCliente = signal<any>(null);
  fechaDesde = signal(this._today());

  // paginación client-side
  currentPage = signal(0);
  readonly pageSize = 20;

  totalPages = computed(() => Math.ceil(this.items().length / this.pageSize) || 1);
  pageItems  = computed(() => {
    const s = this.currentPage() * this.pageSize;
    return this.items().slice(s, s + this.pageSize);
  });
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

  ngOnInit(): void { this.buscar(); }

  buscar(): void {
    this.loading.set(true);
    this.currentPage.set(0);
    const codCliente = this.selCliente()?.codCliente ?? null;
    this.svc.getLista(codCliente, this.fechaDesde()).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  limpiar(): void {
    this.selCliente.set(null); this.fechaDesde.set(this._today()); this.buscar();
  }

  buscarClientes(q: string): void {
    if (!q || q.length < 2) return;
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.cliSvc.getPage(0, q, codEmp).subscribe({ next: r => this.clientes.set(Array.isArray(r) ? r : (r?.content ?? [])) });
  }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.currentPage.set(p); }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
