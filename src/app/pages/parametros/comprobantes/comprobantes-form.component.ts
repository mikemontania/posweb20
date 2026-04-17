import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ComprobantesService } from '../../../core/services/domain/comprobantes.service';
import { TerminalesService } from '../../../core/services/domain/terminales.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Terminales } from '../../../core/models/domain/terminales.model';

@Component({ selector: 'app-comprobantes-form', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comprobantes-form.component.html', styleUrl: './comprobantes.component.css' })
export class ComprobantesForm implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(ComprobantesService);
  private readonly termSvc = inject(TerminalesService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  item = signal<any>({}); loading = signal(false); guardando = signal(false); esEdicion = signal(false);
  terminales = signal<Terminales[]>([]);
  readonly tiposComprobante = ['FACTURA','NOTA_CREDITO','NOTA_DEBITO','RECIBO','TICKET'];
  readonly tiposImpresion   = ['A4','80MM','58MM','PDF'];
  ngOnInit() {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.termSvc.getAll({codempresa:codEmp}).subscribe((r:any)=>this.terminales.set(Array.isArray(r)?r:(r.content??[])));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.esEdicion.set(true); this.loading.set(true);
      this.svc.getById(+id).subscribe({next:(r:any)=>{this.item.set(r);this.loading.set(false);},error:()=>{this.loading.set(false);this.toast.error('Error al cargar');}});
    } else { this.item.set({codEmpresa:codEmp, codSucursal:this.auth.session?.codSucursal??0, activo:true, autoImpresor:false}); }
  }
  get it(): any { return this.item() as any; }

  toUpper(v:string){return(v??'').toUpperCase();}
  get codTermSel(){return(this.item() as any)?.terminal?.codTerminal??0;}
  seleccionarTerminal(id:number){this.item.update(v=>({...v,terminal:this.terminales().find(t=>(t as any).codTerminal===+id)}));}
  set(campo: string, valor: any): void {
    this.item.update(v => ({ ...v, [campo]: valor }));
  }

    guardar(){
    this.guardando.set(true);
    const data=this.item();
    const op=this.esEdicion()?this.svc.update(data.codNumeracion,data):this.svc.create(data);
    op.subscribe({next:()=>{this.guardando.set(false);this.toast.success(this.esEdicion()?'Actualizado':'Creado');this.router.navigate(['/comprobantes']);},
      error:(err:any)=>{this.guardando.set(false);this.toast.apiError(err);}});
  }
}