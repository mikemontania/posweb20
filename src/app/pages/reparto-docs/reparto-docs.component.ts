import {
  Component, OnInit, inject, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RepartoService }  from '../../core/services/domain/reparto.service';
import { SucursalService } from '../../core/services/domain/sucursal.service';
import { ToastService }    from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-reparto-docs',
  standalone: true,
  imports: [DecimalPipe, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reparto-docs.component.html',
  styleUrl: './reparto-docs.component.css',
})
export class RepartoDocsComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly svc     = inject(RepartoService);
  private readonly sucSvc  = inject(SucursalService);
  private readonly toast   = inject(ToastService);

  codReparto  = signal(0);
  codSucursal = signal(0);
  loading     = signal(false);
  actualizando = signal(false);

  marcadores  = signal<any[]>([]);
  sucursal    = signal<any>(null);

  distanciaTotal = computed(() => this.marcadores().reduce((s, m) => s + (m.distancia ?? 0), 0));
  importeTotal   = computed(() => this.marcadores().reduce((s, m) => s + (m.importe ?? 0), 0));

  ngOnInit(): void {
    const codR = +this.route.snapshot.params['codReparto'];
    const codS = +this.route.snapshot.params['codSucursal'];
    this.codReparto.set(codR);
    this.codSucursal.set(codS);

    if (codS > 0) {
      this.sucSvc.getById(codS).subscribe({ next: (s: any) => this.sucursal.set(s) });
    }
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.svc.getMarcadoresById(this.codReparto()).subscribe({
      next: (resp: any[]) => {
        const sorted = [...resp].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        this.marcadores.set(sorted);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar marcadores'); }
    });
  }

  sortBySucursal(): void {
    this.actualizando.set(true);
    this.svc.sortMarkerBySuc(this.codReparto(), this.codSucursal()).subscribe({
      next: (resp: any[]) => {
        this.marcadores.set([...resp].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
        this.actualizando.set(false);
        this.toast.success('Orden actualizado');
      },
      error: () => { this.actualizando.set(false); this.toast.error('Error al ordenar'); }
    });
  }

  setFirst(codRepartoDocs: number): void {
    this.actualizando.set(true);
    this.svc.sortMarkerByMarcador(this.codReparto(), codRepartoDocs).subscribe({
      next: (resp: any[]) => {
        this.marcadores.set([...resp].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
        this.actualizando.set(false);
        this.toast.success('Orden actualizado');
      },
      error: () => { this.actualizando.set(false); this.toast.error('Error al ordenar'); }
    });
  }

  mover(codRepartoDocs: number, direccion: 'UP' | 'DOWN'): void {
    this.actualizando.set(true);
    this.svc.changeOrder(this.codReparto(), codRepartoDocs, direccion).subscribe({
      next: (resp: any[]) => {
        this.marcadores.set([...resp].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
        this.actualizando.set(false);
      },
      error: () => { this.actualizando.set(false); this.toast.error('Error al mover'); }
    });
  }

  abrirMapa(marcador: any): void {
    window.open(`http://www.google.com/maps/place/${marcador.latitud},${marcador.longitud}`, '_blank');
  }
}
