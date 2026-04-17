import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TerminalesService } from '../../../core/services/domain/terminales.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { Terminales } from '../../../core/models/domain/terminales.model';

import { DebounceSearchComponent } from '../../../shared/components/debounce-search/debounce-search.component';
@Component({ selector: 'app-terminales', standalone: true,
  imports: [FormsModule, RouterModule, ModalConfirmComponent, DebounceSearchComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terminales.component.html', 
  styleUrl: './terminales.component.css' })
export class TerminalesComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(TerminalesService);
  private readonly toast = inject(ToastService);
  readonly router        = inject(Router);
  items=signal<Terminales[]>([]); loading=signal(false); busqueda='';
  showDelModal=signal(false); itemAEliminar=signal<Terminales|null>(null); eliminando=signal(false);
  get itemsFiltrados(){const q=this.busqueda.toLowerCase();return q?this.items().filter(i=>JSON.stringify(i).toLowerCase().includes(q)):this.items();}
  onSearch(t: string): void { this.busqueda = t; }
  ngOnInit(){this.cargar();}
  cargar(){this.loading.set(true);this.svc.getAll({codempresa:this.auth.session?.codEmpresa??1}).subscribe({
    next:(r:any)=>{this.items.set(Array.isArray(r)?r:(r.content??[]));this.loading.set(false);},
    error:()=>{this.loading.set(false);this.toast.error('Error');}});}
  solicitarEliminar(item:Terminales){this.itemAEliminar.set(item);this.showDelModal.set(true);}
  confirmarEliminar(){const item=this.itemAEliminar();if(!item)return;this.eliminando.set(true);
    this.svc.delete(item.codTerminalVenta).subscribe({next:()=>{this.showDelModal.set(false);this.eliminando.set(false);this.toast.success('Eliminado');this.cargar();},error:(e:any)=>{this.eliminando.set(false);this.toast.apiError(e);}});}
}
