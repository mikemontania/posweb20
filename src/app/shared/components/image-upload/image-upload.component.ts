import {
  Component, Input, Output, EventEmitter,
  signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="img-upload-wrap">
      <div class="img-upload-preview" (click)="fileInput.click()">
        @if (preview()) {
          <img [src]="preview()" class="img-upload-img" alt="preview"/>
        } @else if (src) {
          <img [src]="src | async" class="img-upload-img" alt="imagen actual"/>
        } @else {
          <div class="img-upload-placeholder">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Clic para subir imagen</span>
          </div>
        }
        <div class="img-upload-overlay">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Cambiar imagen</span>
        </div>
      </div>
      <input #fileInput type="file" accept="image/*" style="display:none" (change)="onFileChange($event)"/>
      @if (preview()) {
        <button type="button" class="img-upload-clear" (click)="clearPreview()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Quitar
        </button>
      }
    </div>
  `,
  styles: [`
    .img-upload-wrap { display:flex; flex-direction:column; gap:.5rem; align-items:flex-start; }
    .img-upload-preview {
      position:relative; width:180px; height:180px;
      border:2px dashed var(--border-color); border-radius:var(--radius-lg);
      cursor:pointer; overflow:hidden; background:var(--bg-surface-2);
      transition:border-color 150ms;
    }
    .img-upload-preview:hover { border-color:var(--color-accent); }
    .img-upload-img { width:100%; height:100%; object-fit:cover; object-position:center; display:block; }
    .img-upload-placeholder {
      width:100%; height:100%; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:.5rem;
      color:var(--text-muted); font-size:.78rem; text-align:center; padding:.75rem;
    }
    .img-upload-overlay {
      position:absolute; inset:0; background:rgba(0,0,0,.45);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:.35rem; color:#fff; font-size:.78rem; font-weight:500;
      opacity:0; transition:opacity 150ms;
    }
    .img-upload-preview:hover .img-upload-overlay { opacity:1; }
    .img-upload-clear {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.2rem .6rem; border:1px solid var(--status-danger-text);
      background:var(--status-danger-bg); color:var(--status-danger-text);
      border-radius:var(--radius-md); font-size:.75rem; cursor:pointer; font-family:inherit;
    }
  `]
})
export class ImageUploadComponent {
  @Input() src: any = null;
  @Input() folder = 'productos';
  @Output() fileSelected = new EventEmitter<File | null>();

  preview = signal<string | null>(null);

  onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => this.preview.set(reader.result as string);
    reader.readAsDataURL(file);
    this.fileSelected.emit(file);
  }

  clearPreview(): void {
    this.preview.set(null);
    this.fileSelected.emit(null);
  }
}
