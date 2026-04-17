import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="app-shell"
      [class.sidebar-collapsed]="sidebar.isCollapsed()"
      [class.sidebar-hidden]="isMobile"
    >
      <app-header/>

      <!-- Overlay mobile -->
      <div
        class="sidebar-overlay"
        [class.active]="sidebar.isMobileOpen()"
        (click)="sidebar.closeMobile()"
      ></div>

      <app-sidebar [class.open]="sidebar.isMobileOpen()"/>

      <main class="main-content">
        <app-breadcrumb/>
        <router-outlet/>
      </main>
    </div>
  `,
})
export class AppShellComponent {
  readonly sidebar = inject(SidebarService);
  isMobile = window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebar.closeMobile();
    }
  }
}
