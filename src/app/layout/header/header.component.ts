import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';
import { ThemeService, THEMES, ThemeId } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly sidebar = inject(SidebarService);
  readonly theme   = inject(ThemeService);
  readonly auth    = inject(AuthService);
  private readonly router = inject(Router);

  readonly themes = THEMES;
  readonly themeOpen = signal(false);

  toggleThemePanel(): void { this.themeOpen.update(v => !v); }
  closeThemePanel(): void  { this.themeOpen.set(false); }

  selectTheme(id: ThemeId): void {
    this.theme.setTheme(id);
    this.closeThemePanel();
  }

  logout(): void {
    this.auth.logout();
  }

  getInitials(name: string): string {
    return (name || 'U')
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}
