// ============================================================
//  ModalConfirmComponent — reemplaza ng-bootstrap modal
//  Uso:
//    <app-modal-confirm
//      [open]="showModal"
//      title="Eliminar cliente"
//      message="¿Confirma eliminar este registro?"
//      confirmLabel="Eliminar"
//      confirmDanger
//      (confirmed)="onDelete()"
//      (cancelled)="showModal = false"
//    />
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, HostListener
} from '@angular/core';

@Component({
  selector: 'app-modal-confirm',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <!-- Backdrop -->
      <div class="mc-backdrop" (click)="onCancel()"></div>

      <!-- Modal -->
      <div class="mc-wrapper" role="dialog" [attr.aria-modal]="true" [attr.aria-label]="title">
        <div class="mc-box">

          <!-- Ícono -->
          <div class="mc-icon" [class.mc-icon--danger]="confirmDanger" [class.mc-icon--warning]="!confirmDanger">
            @if (confirmDanger) {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            } @else {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          </div>

          <h3 class="mc-title">{{ title }}</h3>
          <p class="mc-message">{{ message }}</p>

          <div class="mc-actions">
            <button class="btn btn-ghost" (click)="onCancel()" type="button">
              {{ cancelLabel }}
            </button>
            <button
              class="btn"
              [class.btn-danger]="confirmDanger"
              [class.btn-primary]="!confirmDanger"
              (click)="onConfirm()"
              type="button"
            >
              {{ confirmLabel }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .mc-backdrop {
      position: fixed; inset: 0; z-index: 900;
      background: rgba(0,0,0,.5);
      animation: fadeIn 150ms ease;
    }
    .mc-wrapper {
      position: fixed; inset: 0; z-index: 901;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .mc-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 2rem 1.75rem 1.5rem;
      width: 100%; max-width: 400px;
      box-shadow: var(--shadow-lg);
      animation: slideUp 180ms cubic-bezier(.22,1,.36,1);
      text-align: center;
    }
    .mc-icon {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .mc-icon--danger {
      background: var(--status-danger-bg);
      color: var(--status-danger-text);
    }
    .mc-icon--warning {
      background: var(--status-warning-bg);
      color: var(--status-warning-text);
    }
    .mc-title {
      font-size: 1.0625rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: .625rem;
    }
    .mc-message {
      font-size: .875rem; color: var(--text-secondary);
      line-height: 1.5; margin-bottom: 1.5rem;
    }
    .mc-actions {
      display: flex; gap: .75rem; justify-content: center;
    }
    .mc-actions .btn { min-width: 100px; }
    .btn-danger {
      background: var(--status-danger-bg);
      color: var(--status-danger-text);
      border: 1px solid var(--status-danger-text);
    }
    .btn-danger:hover { opacity: .85; }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes slideUp {
      from { opacity:0; transform: translateY(16px) scale(.97) }
      to   { opacity:1; transform: translateY(0) scale(1) }
    }
  `]
})
export class ModalConfirmComponent {
  @Input() open         = false;
  @Input() title        = 'Confirmar';
  @Input() message      = '¿Estás seguro de esta acción?';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel  = 'Cancelar';
  @Input() confirmDanger = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void { if (this.open) this.onCancel(); }

  onConfirm(): void { this.confirmed.emit(); }
  onCancel():  void { this.cancelled.emit(); }
}
