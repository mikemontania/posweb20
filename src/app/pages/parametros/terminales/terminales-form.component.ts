import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TerminalesService } from '../../../core/services/domain/terminales.service';
import { SucursalService } from '../../../core/services/domain/sucursal.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Terminales } from '../../../core/models/domain/terminales.model';
import { Sucursal } from '../../../core/models/domain/sucursal.model';

@Component({
  selector: 'app-terminales-form',
  standalone: true,
  imports: [FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terminales-form.component.html',
  styleUrl: './terminales.component.css',
})
export class TerminalesFormComponent implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(TerminalesService);
  private readonly sucSvc  = inject(SucursalService);
  private readonly toast   = inject(ToastService);
  private readonly route   = inject(ActivatedRoute);
  readonly router          = inject(Router);

  item      = signal<Terminales>({} as Terminales);
  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);
  sucursales = signal<Sucursal[]>([]);

  get it(): any { return this.item() as any; }
  toUpper(v: string): string { return (v ?? '').toUpperCase(); }
  set(campo: string, valor: any): void {
    this.item.update(v => ({ ...v, [campo]: valor }));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({
      next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])),
    });
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => { this.item.set(r); this.loading.set(false); },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    } else {
      this.item.set({ codEmpresa: codEmp, codSucursal: this.auth.session?.codSucursal ?? 0 } as any);
    }
  }

  guardar(): void {
    this.guardando.set(true);
    const data = this.item();
    const op = this.esEdicion()
      ? this.svc.update((data as any).codTerminal, data)
      : this.svc.create(data);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(this.esEdicion() ? 'Actualizado' : 'Creado');
        this.router.navigate(['/terminales']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
