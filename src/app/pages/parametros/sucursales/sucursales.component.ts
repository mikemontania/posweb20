import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SucursalService } from '../../../core/services/domain/sucursal.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Sucursal } from '../../../core/models/domain/sucursal.model';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({ selector: 'app-sucursales', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sucursales.component.html', styleUrl: './sucursales.component.css' })
export class SucursalesComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(SucursalService);
  private readonly toast = inject(ToastService);
  items = signal<Sucursal[]>([]); loading = signal(false); termino = '';
  showDelModal = signal(false); itemAEliminar = signal<Sucursal|null>(null); eliminando = signal(false);
  ngOnInit() { this.cargar(); }
  cargar() {
    this.loading.set(true);
    this.svc.getAll({ codempresa: this.auth.session?.codEmpresa ?? 1 }).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r)?r:(r.content??[])); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }
  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados(): Sucursal[] {
    if (!this.termino.trim()) return this.items();
    const q = this.termino.toLowerCase();
    return this.items().filter(i => JSON.stringify(i).toLowerCase().includes(q));
  }
  solicitarEliminar(item: Sucursal) { this.itemAEliminar.set(item); this.showDelModal.set(true); }
  confirmarEliminar() {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete((item as any).codSucursal).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false); this.toast.success('Eliminado'); this.cargar(); },
      error: (err:any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}