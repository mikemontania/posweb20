import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly _collapsed = signal(false);
  private readonly _mobileOpen = signal(false);

  readonly isCollapsed = this._collapsed.asReadonly();
  readonly isMobileOpen = this._mobileOpen.asReadonly();

  toggle(): void {
    if (window.innerWidth <= 768) {
      this._mobileOpen.update(v => !v);
    } else {
      this._collapsed.update(v => !v);
    }
  }

  closeMobile(): void {
    this._mobileOpen.set(false);
  }

  openMobile(): void {
    this._mobileOpen.set(true);
  }
}
