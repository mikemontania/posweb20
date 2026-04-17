import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../core/services/sidebar.service';
import { MENU_ITEMS, MenuItem } from '../../core/models/menu.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  readonly sidebarSvc = inject(SidebarService);
  readonly authSvc    = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuItems = MENU_ITEMS;
  readonly expanded  = signal<Set<string>>(new Set());

  ngOnInit(): void {
    // Expand the parent that owns the current route on first load
    this._expandActiveParent(this.router.url);

    // Keep expanding on every subsequent navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this._expandActiveParent(e.urlAfterRedirects ?? e.url));
  }

  private _expandActiveParent(url: string): void {
    for (const item of this.menuItems) {
      if (item.children?.some(c => c.route && url.startsWith(c.route))) {
        this.expanded.update(set => {
          if (set.has(item.label)) return set;
          const next = new Set(set);
          next.add(item.label);
          return next;
        });
      }
    }
  }

  toggleMenu(label: string): void {
    this.expanded.update(set => {
      if (set.has(label)) {
        // ya estaba abierto → cerrar
        const next = new Set(set);
        next.delete(label);
        return next;
      }
      // estaba cerrado → abrir solo este (cierra los demás)
      return new Set([label]);
    });
  }

  isExpanded(label: string): boolean {
    return this.expanded().has(label);
  }

  hasAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    const authorities = this.authSvc.session?.authorities ?? [];
    return item.roles.some(r => authorities.includes(r));
  }

  getInitials(name: string): string {
    return (name || 'U')
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  closeMobile(): void {
    this.sidebarSvc.closeMobile();
  }
}
