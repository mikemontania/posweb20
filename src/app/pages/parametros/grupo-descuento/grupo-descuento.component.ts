import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoDescuentoService } from '../../../core/services/domain/grupo-descuento.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { GrupoDescuento } from '../../../core/models/domain/grupo-descuento.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({ selector: 'app-grupo-descuento', standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grupo-descuento.component.html', styleUrl: './grupo-descuento.component.css' })
export class GrupoDescuentoComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(GrupoDescuentoService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);
  items = signal<GrupoDescuento[]>([]); loading = signal(false); termino = '';
  showDelModal = signal(false); itemAEliminar = signal<GrupoDescuento|null>(null); eliminando = signal(false);
  onSearch(t: string): void { this.termino = t; }

  get itemsFiltrados() { const q=this.termino.toLowerCase(); return q ? this.items().filter(i=>JSON.stringify(i).toLowerCase().includes(q)) : this.items(); }
  ngOnInit() { this.cargar(); }
  cargar() { this.loading.set(true); this.svc.getAll({codempresa: this.auth.session?.codEmpresa??1}).subscribe({ next: (r:any) => { this.items.set(Array.isArray(r)?r:(r.content??[])); this.loading.set(false); }, error: ()=>{ this.loading.set(false); this.toast.error('Error'); } }); }
  solicitarEliminar(item: GrupoDescuento) { this.itemAEliminar.set(item); this.showDelModal.set(true); }
  confirmarEliminar() { const item=this.itemAEliminar(); if(!item) return; this.eliminando.set(true); this.svc.delete(item.codGrupo).subscribe({ next:()=>{ this.showDelModal.set(false); this.eliminando.set(false); this.toast.success('Eliminado'); this.cargar(); }, error:(e:any)=>{ this.eliminando.set(false); this.toast.apiError(e); } }); }
}
