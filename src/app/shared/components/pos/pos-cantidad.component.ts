// pos-cantidad — control +/− reutilizable para POS
// Uso carrito:   <app-pos-cantidad [(valor)]="item.cantidad" [min]="1"/>
// Uso catálogo:  <app-pos-cantidad [(valor)]="cantidad" [min]="1" [size]="'lg'"/>
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule }  from '@angular/forms';

@Component({
  selector: 'app-pos-cantidad',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pc" [class.pc-lg]="size === 'lg'" [class.pc-disabled]="disabled">
      <button class="pc-btn" type="button"
              [disabled]="disabled || valor <= min"
              (click)="step(-1)">−</button>
      <input  class="pc-val" type="number"
              [ngModel]="valor"
              (ngModelChange)="set(+$event)"
              [disabled]="disabled"
              [min]="min"/>
      <button class="pc-btn" type="button"
              [disabled]="disabled"
              (click)="step(+1)">+</button>
    </div>
  `,
  styles: [`
    .pc { display:flex; align-items:center; gap:.2rem; }
    .pc-btn {
      width:22px; height:22px; padding:0;
      border:1.5px solid var(--border-color);
      border-radius:var(--radius-sm,4px);
      background:var(--bg-surface); cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      font-size:.875rem; font-weight:700; color:var(--text-secondary);
      transition:all 100ms; flex-shrink:0; line-height:1;
    }
    .pc-btn:hover:not(:disabled){ border-color:var(--color-accent); color:var(--color-accent); }
    .pc-btn:disabled { opacity:.35; cursor:not-allowed; }
    .pc-val {
      width:40px; height:24px; text-align:center; font-size:.78rem;
      border:1.5px solid var(--border-color); border-radius:var(--radius-md,6px);
      background:var(--bg-surface); color:var(--text-primary); outline:none;
    }
    .pc-val:focus { border-color:var(--color-accent); }
    .pc-val:disabled { opacity:.5; }
    .pc-lg .pc-btn { width:28px; height:28px; font-size:1rem; }
    .pc-lg .pc-val { width:52px; height:28px; font-size:.9rem; }
    .pc-disabled { opacity:.5; pointer-events:none; }
  `]
})
export class PosCantidadComponent {
  @Input() valor    = 1;
  @Input() min      = 1;
  @Input() disabled = false;
  @Input() size: 'sm' | 'lg' = 'sm';
  @Output() valorChange = new EventEmitter<number>();

  step(d: number): void { this.set(this.valor + d); }
  set(v: number): void {
    const n = Math.max(this.min, isNaN(v) ? this.min : Math.round(v));
    this.valorChange.emit(n);
  }
}
