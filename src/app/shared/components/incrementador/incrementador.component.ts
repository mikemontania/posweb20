// ============================================================
//  IncrementadorComponent — migrado a standalone + signals
//  Reemplaza el original con Bootstrap y mdi icons
//  Uso: <app-incrementador [(valor)]="cantidad" [min]="1" [max]="999" />
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  signal, computed, OnChanges, SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incrementador',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="incrementador">
      <button
        class="inc-btn"
        type="button"
        (click)="decrement()"
        [disabled]="internalValue() <= min"
        aria-label="Decrementar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <input
        class="inc-input"
        type="number"
        [min]="min"
        [max]="max"
        [value]="internalValue()"
        (change)="onInputChange($any($event.target).valueAsNumber)"
        (keyup.arrowup)="increment()"
        (keyup.arrowdown)="decrement()"
      />

      <button
        class="inc-btn"
        type="button"
        (click)="increment()"
        [disabled]="internalValue() >= max"
        aria-label="Incrementar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .incrementador {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      height: 36px;
    }
    .inc-btn {
      width: 34px; height: 100%;
      border: none;
      background: var(--bg-surface-2);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background var(--transition), color var(--transition);
      flex-shrink: 0;
    }
    .inc-btn:hover:not(:disabled) {
      background: var(--color-accent-light);
      color: var(--color-accent);
    }
    .inc-btn:disabled { opacity: .4; cursor: not-allowed; }
    .inc-input {
      width: 60px; height: 100%;
      border: none;
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      background: var(--bg-surface);
      color: var(--text-primary);
      text-align: center;
      font-size: .875rem;
      font-weight: 500;
      outline: none;
      -moz-appearance: textfield;
    }
    .inc-input::-webkit-inner-spin-button,
    .inc-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  `]
})
export class IncrementadorComponent implements OnChanges {
  @Input() valor  = 0;
  @Input() min    = 0;
  @Input() max    = 9999;
  @Input() step   = 1;
  @Output() valorChange = new EventEmitter<number>();

  readonly internalValue = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valor']) {
      this.internalValue.set(this.clamp(changes['valor'].currentValue));
    }
  }

  increment(): void { this.setValue(this.internalValue() + this.step); }
  decrement(): void { this.setValue(this.internalValue() - this.step); }

  onInputChange(val: number): void {
    if (!isNaN(val)) this.setValue(val);
  }

  private setValue(val: number): void {
    const clamped = this.clamp(val);
    this.internalValue.set(clamped);
    this.valorChange.emit(clamped);
  }

  private clamp(val: number): number {
    return Math.min(this.max, Math.max(this.min, Math.round(val)));
  }
}
