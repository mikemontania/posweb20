// ============================================================
//  InputMaskDirective — reemplaza angular2-text-mask
//  Máscaras comunes del proyecto:
//    [mask]="'phone'"    → 0981 123 456
//    [mask]="'ruc'"      → 12345678-9
//    [mask]="'date'"     → 31/12/2026
//    [mask]="'currency'" → solo números y punto
//    [mask]="'custom'"   → usar [maskPattern] con regex
// ============================================================
import {
  Directive, Input, HostListener, ElementRef, OnInit
} from '@angular/core';

type MaskType = 'phone' | 'ruc' | 'date' | 'currency' | 'custom';

@Directive({ selector: '[inputMask]', standalone: true })
export class InputMaskDirective implements OnInit {
  @Input('inputMask') mask: MaskType = 'custom';
  @Input() maskPattern?: RegExp;

  private el!: HTMLInputElement;

  constructor(private ref: ElementRef) {}

  ngOnInit(): void {
    this.el = this.ref.nativeElement;
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const raw = this.el.value;
    this.el.value = this.apply(raw);
    // dispara Change para que Angular reactive forms detecte
    this.el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.mask === 'currency') {
      const allowed = /[0-9.]|Backspace|Delete|Arrow|Tab/;
      if (!allowed.test(event.key)) event.preventDefault();
    }
  }

  private apply(raw: string): string {
    switch (this.mask) {
      case 'phone':
        // 0981 123 456  → 13 chars máx
        return raw.replace(/\D/g, '').slice(0, 10)
          .replace(/(\d{4})(\d{3})?(\d{0,3})/, (_, a, b, c) =>
            [a, b, c].filter(Boolean).join(' '));

      case 'ruc':
        // 12345678-9
        return raw.replace(/\D/g, '').slice(0, 9)
          .replace(/(\d{1,8})(\d{0,1})/, (_, a, b) =>
            b ? `${a}-${b}` : a);

      case 'date':
        // DD/MM/YYYY
        return raw.replace(/\D/g, '').slice(0, 8)
          .replace(/(\d{2})(\d{2})?(\d{0,4})/, (_, d, m, y) =>
            [d, m, y].filter(Boolean).join('/'));

      case 'currency':
        return raw.replace(/[^0-9.]/g, '')
          .replace(/(\..*)\./g, '$1'); // solo un punto decimal

      case 'custom':
        if (this.maskPattern) {
          return raw.replace(this.maskPattern, '');
        }
        return raw;

      default:
        return raw;
    }
  }
}
