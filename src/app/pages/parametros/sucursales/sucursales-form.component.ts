import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService }   from '../../../core/services/auth.service';
import { SucursalService } from '../../../core/services/domain/sucursal.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LeafletMapComponent } from '../../../shared/components/leaflet-map/leaflet-map.component';

@Component({
  selector: 'app-sucursales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LeafletMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sucursales-form.component.html',
  styleUrl: './sucursales.component.css',
})
export class SucursalesComponentForm implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly svc    = inject(SucursalService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);
  mapLat    = signal(-25.2969);
  mapLng    = signal(-57.5949);

  readonly modoVendedorOpts = ['GENERAL', 'DETALLE'];

  form = this.fb.group({
    codSucursalErp: ['', Validators.required],
    nombreSucursal: ['', [Validators.required, Validators.minLength(3)]],
    direccion:      ['', [Validators.required, Validators.minLength(5)]],
    telefono:       ['', [Validators.required, Validators.minLength(6)]],
    email:          ['', [Validators.required, Validators.email]],
    centro:         [''],
    mensaje:        [''],
    modoVendedor:   ['GENERAL'],
    principal:      [false],
    envioposventa:  [false],
    latitud:        [-25.2969],
    longitud:       [-57.5949],
  });

  mapPopup = computed(() => this.form.value.nombreSucursal || 'Sucursal');

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (r: any) => {
          this.form.patchValue({
            codSucursalErp: r.codSucursalErp ?? '',
            nombreSucursal: r.nombreSucursal ?? '',
            direccion:      r.direccion ?? '',
            telefono:       r.telefono ?? '',
            email:          r.email ?? '',
            centro:         r.centro ?? '',
            mensaje:        r.mensaje ?? '',
            modoVendedor:   r.modoVendedor ?? 'GENERAL',
            principal:      r.principal ?? false,
            envioposventa:  r.envioposventa ?? false,
            latitud:        r.latitud ?? -25.2969,
            longitud:       r.longitud ?? -57.5949,
          });
          this.mapLat.set(r.latitud ?? -25.2969);
          this.mapLng.set(r.longitud ?? -57.5949);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
      });
    } else {
      this.form.patchValue({ latitud: -25.2969, longitud: -57.5949 });
    }
  }

  onMapCoords(coords: { lat: number; lng: number }): void {
    this.form.patchValue({ latitud: coords.lat, longitud: coords.lng });
    this.mapLat.set(coords.lat);
    this.mapLng.set(coords.lng);
  }

  toUpper(field: string): void {
    const v = this.form.get(field)?.value;
    if (typeof v === 'string') this.form.get(field)?.setValue(v.toUpperCase(), { emitEvent: false });
  }

  hasError(field: string, error?: string): boolean {
    const c = this.form.get(field);
    if (!c || !c.touched) return false;
    return error ? c.hasError(error) : c.invalid;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const payload = { ...this.form.value, codEmpresa: this.auth.session?.codEmpresa ?? 1 };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id
      ? this.svc.update(+id, payload as any)
      : this.svc.create(payload as any);
    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(id ? 'Sucursal actualizada' : 'Sucursal creada');
        this.router.navigate(['/sucursales']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }
}
