import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TipoMedioPagoService } from '../../../core/services/domain/tipo-medio-pago.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { TipoMedioPago } from '../../../core/models/domain/tipo-medio-pago.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({ selector: 'app-tipo-medio-pago', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tipo-medio-pago.component.html', styleUrl: './tipo-medio-pago.component.css' })
export class TipoMedioPagoComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(TipoMedioPagoService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);
  items=signal<TipoMedioPago[]>([]); loading=signal(false); busqueda='';
  showDelModal=signal(false); itemAEliminar=signal<TipoMedioPago|null>(null); eliminando=signal(false);
  get itemsFiltrados(){const q=this.busqueda.toLowerCase();return q?this.items().filter(i=>JSON.stringify(i).toLowerCase().includes(q)):this.items();}
  onSearch(t: string): void { this.busqueda = t; }
  ngOnInit(){this.cargar();}
  cargar(){this.loading.set(true);this.svc.getAll({codempresa:this.auth.session?.codEmpresa??1}).subscribe({
    next:(r:any)=>{this.items.set(Array.isArray(r)?r:(r.content??[]));this.loading.set(false);},
    error:()=>{this.loading.set(false);this.toast.error('Error');}});}
  solicitarEliminar(item:TipoMedioPago){this.itemAEliminar.set(item);this.showDelModal.set(true);}
  confirmarEliminar(){const item=this.itemAEliminar();if(!item)return;this.eliminando.set(true);
    this.svc.delete(item.codTipoMedioPago).subscribe({next:()=>{this.showDelModal.set(false);this.eliminando.set(false);this.toast.success('Eliminado');this.cargar();},error:(e:any)=>{this.eliminando.set(false);this.toast.apiError(e);}});}
}
