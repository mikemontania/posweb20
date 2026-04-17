import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ComprobantesService } from '../../../core/services/domain/comprobantes.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({ selector: 'app-comprobantes', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comprobantes.component.html', styleUrl: './comprobantes.component.css' })
export class Comprobantes implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(ComprobantesService);
  private readonly toast = inject(ToastService);
  items = signal<any[]>([]); loading = signal(false); termino = '';
  showDelModal = signal(false); itemAEliminar = signal<any>(null); eliminando = signal(false);
  ngOnInit() { this.cargar(); }
  cargar() {
    this.loading.set(true);
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const codSuc = this.auth.session?.codSucursal ?? 0;
    this.svc.getAll({ codempresa: codEmp, codsucursal: codSuc }).subscribe({
      next: (r: any) => {
        const raw = Array.isArray(r) ? r : (r.content ?? []);
        this.items.set(raw.map((c: any) => ({
          ...c,
          _terminal: c.terminal?.descripcion ?? '—',
          _tipo:     c.tipoComprobante ?? '—',
        })));
        this.loading.set(false);
      }, error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }
  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): any[] {
    if (!this.termino.trim()) return this.items();
    const q = this.termino.toLowerCase();
    return this.items().filter(i => JSON.stringify(i).toLowerCase().includes(q));
  }
  solicitarEliminar(item: any) { this.itemAEliminar.set(item); this.showDelModal.set(true); }
  confirmarEliminar() {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codNumeracion).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false); this.toast.success('Eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}