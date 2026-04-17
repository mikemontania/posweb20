import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuponService } from '../../core/services/domain/cupon.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cupones.component.html',
  styleUrl: './cupones.component.css',
})
export class CuponesComponent implements OnInit {
  private readonly svc   = inject(CuponService);
  private readonly toast = inject(ToastService);

  loading       = signal(false);
  items         = signal<any[]>([]);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);
  keyword       = signal('');

  pageNumbers = computed(() => {
    const total = this.totalPages(), cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | '...')[] = [0];
    if (cur > 2) pages.push('...');
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  });

  ngOnInit(): void { this.buscar(0); }

  buscar(page = 0): void {
    this.loading.set(true);
    this.svc.getPage(page, this.keyword()).subscribe({
      next: (r: any) => {
        this.items.set(r.content ?? []);
        this.totalElements.set(r.totalElements ?? 0);
        this.totalPages.set(r.totalPages ?? 1);
        this.currentPage.set(r.number ?? page);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar cupones'); }
    });
  }

  limpiar(): void { this.keyword.set(''); this.buscar(0); }

  goToPage(p: number | '...'): void { if (typeof p === 'number') this.buscar(p); }
}
