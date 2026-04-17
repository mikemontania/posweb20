import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlianzasService } from '../../core/services/domain/alianzas.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';

@Component({ selector: 'app-alianzas', standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alianzas.component.html', styleUrl: './alianzas.component.css' })
export class AlianzasComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(AlianzasService);
  private readonly toast = inject(ToastService);
  items = signal<any[]>([]); loading = signal(false); busqueda = '';
  showDelModal = signal(false); itemAEliminar = signal<any>(null); eliminando = signal(false);
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.loading.set(true);
    this.svc.getAll({ codempresa: this.auth.session?.codEmpresa ?? 1 }).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : (r.content ?? [])); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }
  get itemsFiltrados(): any[] {
    if (!this.busqueda.trim()) return this.items();
    const q = this.busqueda.toLowerCase();
    return this.items().filter(i => JSON.stringify(i).toLowerCase().includes(q));
  }
  solicitarEliminar(item: any): void { this.itemAEliminar.set(item); this.showDelModal.set(true); }
  confirmarEliminar(): void {
    const item = this.itemAEliminar(); if (!item) return;
    this.eliminando.set(true);
    this.svc.delete(item.codAlianza).subscribe({
      next: () => { this.showDelModal.set(false); this.eliminando.set(false); this.toast.success('Eliminado'); this.cargar(); },
      error: (err: any) => { this.eliminando.set(false); this.toast.apiError(err); }
    });
  }
}