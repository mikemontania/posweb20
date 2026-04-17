import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DepositoService } from '../../../core/services/domain/deposito.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';

@Component({ selector: 'app-depositos', standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depositos.component.html', styleUrl: './depositos.component.css' })
export class Depositos implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(DepositoService);
  private readonly toast = inject(ToastService);
  items = signal<any[]>([]); loading = signal(false); termino = '';
  showDelModal = signal(false); itemAEliminar = signal<any>(null); eliminando = signal(false);
  ngOnInit() { this.cargar(); }
  cargar() {
    this.loading.set(true);
    this.svc.getAll({ codempresa: this.auth.session?.codEmpresa ?? 1 }).subscribe({
      next: (r: any) => {
        const raw = Array.isArray(r) ? r : (r.content ?? []);
        this.items.set(raw.map((d: any) => ({...d,
          _sucursal: d.sucursal?.nombreSucursal ?? '—',
          _tipo:     d.tipoDeposito?.descripcion ?? '—' })));
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
    this.svc.delete(item.codDeposito).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false); this.toast.success('Eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}