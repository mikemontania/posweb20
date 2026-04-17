// ============================================================
//  DebounceSearchComponent
//  Barra de búsqueda con debounce, uppercase, botón limpiar
//  Uso: <app-debounce-search placeholder="Buscar..." (searched)="onSearch($event)"/>
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-debounce-search',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dsearch-bar">
      <svg class="dsearch-icon" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        class="dsearch-input"
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        autocomplete="off"
        spellcheck="false"
      />
      @if (value()) {
        <button class="dsearch-clear" type="button" (click)="clear()" title="Limpiar búsqueda">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .dsearch-bar {
      display: flex; align-items: center; gap: .5rem;
      background: var(--bg-surface);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: .45rem .85rem;
      transition: border-color 150ms, box-shadow 150ms;
      width: 100%; max-width: 420px;
    }
    .dsearch-bar:focus-within {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 12%, transparent);
    }
    .dsearch-icon {
      flex-shrink: 0;
      color: var(--text-muted);
    }
    .dsearch-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: .875rem; color: var(--text-primary);
      font-family: inherit; min-width: 0;
    }
    .dsearch-input::placeholder { color: var(--text-muted); }
    .dsearch-clear {
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; padding: 0;
      background: var(--bg-surface-2); border: none;
      border-radius: 50%; cursor: pointer;
      color: var(--text-muted); transition: all 120ms;
    }
    .dsearch-clear:hover {
      background: var(--status-danger-bg);
      color: var(--status-danger-text);
    }
  `]
})
export class DebounceSearchComponent {
  @Input() placeholder = 'Buscar...';
  @Input() delay = 400;
  @Input() uppercase = true;
  @Output() searched = new EventEmitter<string>();

  value = signal('');
  private readonly subject$ = new Subject<string>();
  private sub = this.subject$.pipe(
    debounceTime(this.delay),
    distinctUntilChanged()
  ).subscribe(v => this.searched.emit(v));

  onInput(e: Event): void {
    let v = (e.target as HTMLInputElement).value;
    if (this.uppercase) v = v.toUpperCase();
    (e.target as HTMLInputElement).value = v;
    this.value.set(v);
    this.subject$.next(v);
  }

  clear(): void {
    this.value.set('');
    this.subject$.next('');
    this.searched.emit('');
  }
}
