import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService }              from '../../core/services/auth.service';
import { SearchStateService }       from '../../core/services/search-state.service';
import { TransferenciaService }     from '../../core/services/domain/transferencia.service';
import { MotivoTransferenciaService } from '../../core/services/domain/motivo-transferencia.service';
import { ToastService }             from '../../shared/components/toast/toast.service';
import { SelectSearchComponent }    from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-transferencias-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SelectSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transferencias-lista.component.html',
  styleUrl: './transferencias-lista.component.css',
})
export class TransferenciasListaComponent implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly stateSvc   = inject(SearchStateService);
  private readonly svc        = inject(TransferenciaService);
  private readonly motivoSvc  = inject(MotivoTransferenciaService);
  private readonly toast      = inject(ToastService);

  // ── Lista ─────────────────────────────────────────────────
  items         = signal<any[]>([]);
  loading       = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);

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

  // ── Filtros ────────────────────────────────────────────────
  fechaDesde     = signal(this._today());
  fechaHasta     = signal(this._today());
  nroComprobante = signal('');
  estado         = signal('TODOS');

  motivos   = signal<any[]>([]);
  selMotivo = signal<any>(null);
  anulando  = signal(false);

  // ── Modal anular ───────────────────────────────────────────
  showAnularModal     = signal(false);
  transferenciaAnular = signal<any>(null);
  selMotivoAnular     = signal<any>(null);

  readonly estadoOpts = ['TODOS', 'CONFIRMADO', 'PENDIENTE', 'ANULADO'];

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.motivoSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.motivos.set(Array.isArray(r) ? r : [])
    });

    const saved = this.stateSvc.get('transferencias-lista');
    if (saved) {
      this.fechaDesde.set(saved.fechaDesde);
      this.fechaHasta.set(saved.fechaHasta);
      this.nroComprobante.set(saved.nroComprobante);
      this.estado.set(saved.estado);
      this.buscar(saved.page ?? 0);
    } else {
      this.buscar();
    }
  }

  buscar(page = 0): void {
    this.stateSvc.save('transferencias-lista', {
      fechaDesde: this.fechaDesde(), fechaHasta: this.fechaHasta(),
      nroComprobante: this.nroComprobante(), estado: this.estado(), page,
    });
    this.loading.set(true);
    this.svc.findByFecha(
      page,
      this.fechaDesde(), this.fechaHasta(),
      null, this.nroComprobante(), this.estado(), 20
    ).subscribe({
      next: (r: any) => {
        this.items.set(Array.isArray(r) ? r : (r.content ?? []));
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar transferencias'); }
    });
  }

  limpiar(): void {
    this.stateSvc.clear('transferencias-lista');
    this.fechaDesde.set(this._today());
    this.fechaHasta.set(this._today());
    this.nroComprobante.set('');
    this.estado.set('TODOS');
    this.buscar(0);
  }

  goToPage(p: number | '...'): void {
    if (typeof p !== 'number') return;
    this.buscar(p);
  }

  solicitarAnular(t: any): void {
    this.transferenciaAnular.set(t);
    this.selMotivoAnular.set(null);
    this.showAnularModal.set(true);
  }

  confirmarAnular(): void {
    const t = this.transferenciaAnular();
    if (!t) return;
    if (!this.selMotivoAnular()) { this.toast.error('Seleccione un motivo de anulación'); return; }
    this.anulando.set(true);
    this.svc.anular(t.codTransferencia, this.selMotivoAnular()).subscribe({
      next: () => {
        this.anulando.set(false);
        this.showAnularModal.set(false);
        this.toast.success('Transferencia anulada');
        this.buscar(this.currentPage());
      },
      error: (e: any) => { this.anulando.set(false); this.toast.apiError(e); }
    });
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }

  private _today(): string { return new Date().toISOString().slice(0, 10); }
}
