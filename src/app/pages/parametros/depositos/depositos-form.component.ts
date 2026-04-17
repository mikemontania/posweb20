import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {  } from '@angular/common'; import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DepositoService } from '../../../core/services/domain/deposito.service';
import { SucursalService } from '../../../core/services/domain/sucursal.service';
import { TipoDepositoService } from '../../../core/services/domain/tipo-deposito.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Sucursal } from '../../../core/models/domain/sucursal.model';
import { TipoDeposito } from '../../../core/models/domain/tipo-deposito.model';
@Component({ selector: 'app-depositos-form', standalone: true,
  imports: [FormsModule, RouterModule], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depositos-form.component.html', styleUrl: './depositos.component.css' })
export class DepositosForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(DepositoService);
  private readonly sucSvc = inject(SucursalService);
  private readonly tipSvc = inject(TipoDepositoService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  item = signal<any>({}); loading = signal(false); guardando = signal(false); esEdicion = signal(false);
  sucursales = signal<Sucursal[]>([]); tiposDeposito = signal<TipoDeposito[]>([]);
  ngOnInit() {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.sucSvc.getAll({codempresa:codEmp}).subscribe((r:any) => this.sucursales.set(Array.isArray(r)?r:(r.content??[])));
    this.tipSvc.getAll({codempresa:codEmp}).subscribe((r:any) => this.tiposDeposito.set(Array.isArray(r)?r:(r.content??[])));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({ next:(r:any)=>{ this.item.set(r); this.loading.set(false); }, error:()=>{ this.loading.set(false); this.toast.error('Error al cargar'); }});
    } else { this.item.set({ codEmpresa: codEmp }); }
  }
  get it(): any { return this.item() as any; }

  toUpper(v:string) { return (v??'').toUpperCase(); }
  get codTipoSel() { return (this.item() as any)?.tipoDeposito?.codTipoDeposito ?? 0; }
  get codSucSel()  { return (this.item() as any)?.sucursal?.codSucursal ?? 0; }
  seleccionarTipo(id:number) { this.item.update(v=>({...v, tipoDeposito: this.tiposDeposito().find(t=>t.codTipoDeposito===+id)})); }
  seleccionarSucursal(id:number) { this.item.update(v=>({...v, sucursal: this.sucursales().find(s=>s.codSucursal===+id), codSucursal:+id})); }
  set(campo: string, valor: any): void {
    this.item.update(v => ({ ...v, [campo]: valor }));
  }

    guardar() {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion() ? this.svc.update(data.codDeposito, data) : this.svc.create(data);
    op.subscribe({ next:()=>{ this.guardando.set(false); this.toast.success(this.esEdicion()?'Actualizado':'Creado'); this.router.navigate(['/depositos']); },
      error:(err:any)=>{ this.guardando.set(false); this.toast.apiError(err); }});
  }
}