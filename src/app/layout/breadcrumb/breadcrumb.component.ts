import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface Crumb { label: string; url: string; }

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a routerLink="/dashboard" class="breadcrumb-home" title="Dashboard">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </a>
      @for (crumb of crumbs(); track crumb.url; let last = $last) {
        <span class="breadcrumb-sep">/</span>
        @if (!last) {
          <a [routerLink]="crumb.url">{{ crumb.label }}</a>
        } @else {
          <span class="breadcrumb-current">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  readonly crumbs = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.buildCrumbs())
    ),
    { initialValue: this.buildCrumbs() }
  );

  private buildCrumbs(): Crumb[] {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(Boolean);
    return segments.map((seg, i) => ({
      label: this.formatLabel(seg),
      url: '/' + segments.slice(0, i + 1).join('/'),
    }));
  }

  private formatLabel(seg: string): string {
    return seg
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
