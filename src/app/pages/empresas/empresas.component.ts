import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService }    from '../../core/services/auth.service';
import { EmpresasService } from '../../core/services/domain/empresas.service';
import { ToastService }   from '../../shared/components/toast/toast.service';
import { ImagenPipe }     from '../../shared/pipes/imagen.pipe';
import { Empresas }       from '../../core/models/domain/empresas.model';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css',
})
export class EmpresasComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly svc   = inject(EmpresasService);
  private readonly toast = inject(ToastService);

  loading   = signal(true);
  empresa   = signal<Empresas | null>(null);
  editando  = signal(false);
  guardando = signal(false);

  logoFile        = signal<File | null>(null);
  logoPreview     = signal<string | null>(null);
  reporteFile     = signal<File | null>(null);
  reportePreview  = signal<string | null>(null);

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    this.svc.getById(codEmp).subscribe({
      next: (r: any) => { this.empresa.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar empresa'); }
    });
  }

  editar(): void  { this.editando.set(true); }
  cancelar(): void { this.editando.set(false); this.logoFile.set(null); this.logoPreview.set(null); this.reporteFile.set(null); this.reportePreview.set(null); }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) { this.toast.error('Seleccione una imagen válida'); return; }
    this.logoFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onReporteChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) { this.toast.error('Seleccione una imagen válida'); return; }
    this.reporteFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.reportePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardar(): void {
    const e = this.empresa(); if (!e) return;
    this.guardando.set(true);
    this.svc.updateBody(e).subscribe({
      next: (updated: Empresas) => {
        const cod = updated.codEmpresa;
        const logo$    = this.logoFile()    ? this.svc.uploadImage(this.logoFile()!, cod)       : null;
        const reporte$ = this.reporteFile() ? this.svc.uploadImageReport(this.reporteFile()!, cod) : null;
        const uploads = [logo$, reporte$].filter(Boolean) as any[];
        if (uploads.length === 0) { this._finGuardar(updated); return; }
        let done = 0;
        uploads.forEach(op => op.subscribe({ next: (r: Empresas) => { if (++done === uploads.length) this._finGuardar(r); }, error: () => this._finGuardar(updated) }));
      },
      error: (e: any) => { this.guardando.set(false); this.toast.apiError(e); }
    });
  }

  private _finGuardar(e: Empresas): void {
    this.empresa.set(e); this.guardando.set(false); this.editando.set(false);
    this.logoFile.set(null); this.logoPreview.set(null); this.reporteFile.set(null); this.reportePreview.set(null);
    this.toast.success('Empresa actualizada');
  }

  isAdmin(): boolean { return this.auth.session?.authorities?.includes('ROLE_ADMIN') ?? false; }

  patch(key: keyof Empresas, val: any): void {
    this.empresa.update(e => e ? { ...e, [key]: val } : e);
  }
}
