import {
  Component, OnInit, OnDestroy, inject, signal,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AuthService }         from '../../core/services/auth.service';
import { ClienteService }      from '../../core/services/domain/cliente.service';
import { SucursalService }     from '../../core/services/domain/sucursal.service';
import { ListaPrecioService }  from '../../core/services/domain/lista-precio.service';
import { MedioPagoService }    from '../../core/services/domain/medio-pago.service';
import { FormaVentaService }   from '../../core/services/domain/forma-venta.service';
import { GrupoDescuentoService }from '../../core/services/domain/grupo-descuento.service';
import { ToastService }        from '../../shared/components/toast/toast.service';
import { LeafletMapComponent } from '../../shared/components/leaflet-map/leaflet-map.component';
import { SelectSearchComponent } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-clientes-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterModule,
    LeafletMapComponent, SelectSearchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clientes-form.component.html',
  styleUrl: './clientes.component.css',
})
export class ClientesForm implements OnInit, OnDestroy {
  private readonly auth    = inject(AuthService);
  private readonly svc     = inject(ClienteService);
  private readonly sucSvc  = inject(SucursalService);
  private readonly lpSvc   = inject(ListaPrecioService);
  private readonly mpSvc   = inject(MedioPagoService);
  private readonly fvSvc   = inject(FormaVentaService);
  private readonly gdSvc   = inject(GrupoDescuentoService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly fb      = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // ── estado ─────────────────────────────────────────────────
  loading   = signal(false);
  guardando = signal(false);
  esEdicion = signal(false);

  // ── coordenadas del mapa ───────────────────────────────────
  mapLat = signal(-25.2969);
  mapLng = signal(-57.5949);

  // ── catalogos para selectors ───────────────────────────────
  sucursales    = signal<any[]>([]);
  listasPrecios = signal<any[]>([]);
  mediosPago    = signal<any[]>([]);
  formasVenta   = signal<any[]>([]);
  grupos        = signal<any[]>([]);

  loadingSuc = signal(false);
  loadingLP  = signal(false);
  loadingMP  = signal(false);
  loadingFV  = signal(false);
  loadingGD  = signal(false);

  // ── objetos relacionales seleccionados ─────────────────────
  selSucursal    = signal<any>(null);
  selListaPrecio = signal<any>(null);
  selMedioPago   = signal<any>(null);
  selFormaVenta  = signal<any>(null);
  selGrupo       = signal<any>(null);

  // ── tipos de documento ─────────────────────────────────────
  readonly tiposDoc = ['RUC', 'CI', 'CE', 'PAS'];
  readonly catsABC  = ['A', 'B', 'C'];

  // ── formulario reactivo ───────────────────────────────────
  form = this.fb.group({
    codClienteErp:     [''],
    razonSocial:       ['', [Validators.required, Validators.minLength(3)]],
    tipoDoc:           ['RUC', Validators.required],
    docNro:            ['', Validators.required],
    telefono:          [''],
    email:             ['', Validators.email],
    direccion:         [''],
    obs:               [''],
    catABC:            ['B'],
    diasCredito:       [0],
    carnetGrupo:       [''],
    carnetVencimiento: [''],
    latitud:           [-25.2969],
    longitud:          [-57.5949],
    activo:            [true],
    excentoIva:        [false],
    predeterminado:    [false],
    esPropietario:     [false],
    empleado:          [false],
    codeBarra:         [false],
  });

  // ── popup del mapa ─────────────────────────────────────────
  mapPopup = computed(() => this.form.value.razonSocial || 'Cliente');

  // ── búsquedas de sujección ──────────────────────────────────
  readonly searchSuc$ = new Subject<string>();
  readonly searchLP$  = new Subject<string>();
  readonly searchMP$  = new Subject<string>();
  readonly searchFV$  = new Subject<string>();
  readonly searchGD$  = new Subject<string>();

  ngOnInit(): void {
    const codEmp = this.auth.session?.codEmpresa ?? 1;

    // Cargar catálogos iniciales
    this.loadCatalogos(codEmp);

    // Búsqueda con debounce para cada selector
    this.setupSearch(this.searchSuc$, codEmp, this.sucursales, this.sucSvc,   this.loadingSuc);
    this.setupSearch(this.searchLP$,  codEmp, this.listasPrecios, this.lpSvc, this.loadingLP);
    this.setupSearch(this.searchMP$,  codEmp, this.mediosPago, this.mpSvc,    this.loadingMP);
    this.setupSearch(this.searchFV$,  codEmp, this.formasVenta, this.fvSvc,   this.loadingFV);
    this.setupSearch(this.searchGD$,  codEmp, this.grupos, this.gdSvc,        this.loadingGD);

    // Cargar cliente si es edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.loading.set(true);
      this.svc.getById(+id).subscribe({
        next: (c: any) => {
          this.form.patchValue({
            codClienteErp:     c.codClienteErp ?? '',
            razonSocial:       c.razonSocial ?? '',
            tipoDoc:           c.tipoDoc ?? 'RUC',
            docNro:            c.docNro ?? '',
            telefono:          c.telefono ?? '',
            email:             c.email ?? '',
            direccion:         c.direccion ?? '',
            obs:               c.obs ?? '',
            catABC:            c.catABC ?? 'B',
            diasCredito:       c.diasCredito ?? 0,
            carnetGrupo:       c.carnetGrupo ?? '',
            carnetVencimiento: c.carnetVencimiento ?? '',
            latitud:           c.latitud ?? -25.2969,
            longitud:          c.longitud ?? -57.5949,
            activo:            c.activo ?? true,
            excentoIva:        c.excentoIva ?? false,
            predeterminado:    c.predeterminado ?? false,
            esPropietario:     c.esPropietario ?? false,
            empleado:          c.empleado ?? false,
            codeBarra:         c.codeBarra ?? false,
          });
          this.mapLat.set(c.latitud ?? -25.2969);
          this.mapLng.set(c.longitud ?? -57.5949);
          this.selSucursal.set(c.sucursalPref ?? null);
          this.selListaPrecio.set(c.listaPrecio ?? null);
          this.selMedioPago.set(c.medioPagoPref ?? null);
          this.selFormaVenta.set(c.formaVentaPref ?? null);
          this.selGrupo.set(c.grupoDescuento ?? null);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error('Error al cargar cliente'); }
      });
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadCatalogos(codEmp: number): void {
    this.sucSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.sucursales.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.lpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.listasPrecios.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.mpSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.mediosPago.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.fvSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.formasVenta.set(Array.isArray(r) ? r : (r.content ?? [])) });
    this.gdSvc.getAll({ codempresa: codEmp }).subscribe({ next: (r: any) => this.grupos.set(Array.isArray(r) ? r : (r.content ?? [])) });
  }

  private setupSearch(subject$: Subject<string>, codEmp: number, target: any, svc: any, loadingSignal: any): void {
    subject$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => {
      loadingSignal.set(true);
      svc.getAll({ codempresa: codEmp, keyword: q }).subscribe({
        next: (r: any) => { target.set(Array.isArray(r) ? r : (r.content ?? [])); loadingSignal.set(false); },
        error: () => loadingSignal.set(false),
      });
    });
  }

  // ── handlers del mapa ─────────────────────────────────────
  onMapCoords(coords: { lat: number; lng: number }): void {
    this.form.patchValue({ latitud: coords.lat, longitud: coords.lng });
    this.mapLat.set(coords.lat);
    this.mapLng.set(coords.lng);
  }

  // ── upper case helpers ─────────────────────────────────────
  toUpper(field: string): void {
    const v = this.form.get(field)?.value;
    if (typeof v === 'string') this.form.get(field)?.setValue(v.toUpperCase(), { emitEvent: false });
  }

  // ── guardar ─────────────────────────────────────────────────
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    const payload: any = {
      ...v,
      codEmpresa:    this.auth.session?.codEmpresa ?? 1,
      sucursalPref:  this.selSucursal(),
      listaPrecio:   this.selListaPrecio(),
      medioPagoPref: this.selMedioPago(),
      formaVentaPref:this.selFormaVenta(),
      grupoDescuento:this.selGrupo(),
    };

    this.guardando.set(true);
    const id = this.route.snapshot.paramMap.get('id');
    const op = id
      ? this.svc.update(+id, payload)
      : this.svc.create(payload);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(id ? 'Cliente actualizado' : 'Cliente creado');
        this.router.navigate(['/clientes']);
      },
      error: (err: any) => { this.guardando.set(false); this.toast.apiError(err); }
    });
  }

  // ── helpers para errores del form ─────────────────────────
  hasError(field: string, error?: string): boolean {
    const c = this.form.get(field);
    if (!c || !c.touched) return false;
    return error ? c.hasError(error) : c.invalid;
  }
}
