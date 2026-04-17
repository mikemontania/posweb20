import {
  Component, OnInit, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CanjeService } from '../../core/services/domain/canje.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ImagenPipe }   from '../../shared/pipes/imagen.pipe';

@Component({
  selector: 'app-canje-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagenPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canje-detalle.component.html',
  styleUrl: './canje-detalle.component.css',
})
export class CanjeDetalleComponent implements OnInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly svc      = inject(CanjeService);
  private readonly toast    = inject(ToastService);

  loading  = signal(true);
  canje    = signal<any>(null);
  detalles = signal<any[]>([]);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (!id) { this.loading.set(false); return; }
    this.svc.getById(id).subscribe({
      next: (r: any) => {
        const c = r?.canje ?? r;
        this.canje.set(c);
        this.detalles.set(c.detalle ?? []);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar'); }
    });
  }

  atras(): void { this.location.back(); }
}
