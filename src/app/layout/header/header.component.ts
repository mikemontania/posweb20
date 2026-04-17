import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { timer } from 'rxjs';
import { switchMap, catchError, EMPTY } from 'rxjs';
import { SidebarService } from '../../core/services/sidebar.service';
import { ThemeService, THEMES, ThemeId } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { PedidosService } from '../../core/services/domain/pedidos.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  readonly sidebar    = inject(SidebarService);
  readonly theme      = inject(ThemeService);
  readonly auth       = inject(AuthService);
  private readonly pedidosSvc  = inject(PedidosService);
  private readonly destroyRef  = inject(DestroyRef);

  readonly themes    = THEMES;
  readonly themeOpen = signal(false);

  private readonly POLL_INTERVAL = 5 * 60 * 1000;

  // ── Pedidos pendientes ────────────────────────────────
  readonly pendientes        = signal<any[]>([]);
  readonly notifOpen         = signal(false);
  readonly notifLoading      = signal(false);
  readonly canVerPendientes  = signal(false);

  ngOnInit(): void {
    this.canVerPendientes.set(this._canVerPendientes());
    if (!this.canVerPendientes()) return;
    const codSuc = this._codSucursal();
    timer(0, this.POLL_INTERVAL).pipe(
      switchMap(() => {
        this.notifLoading.set(true);
        return this.pedidosSvc.findPendientes(codSuc).pipe(
          catchError(() => EMPTY)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((r: any) => {
      this.pendientes.set(Array.isArray(r) ? r : (r?.content ?? []));
      this.notifLoading.set(false);
    });
  }

  refreshPendientes(): void {
    if (!this._canVerPendientes()) return;
    this.notifLoading.set(true);
    this.pedidosSvc.findPendientes(this._codSucursal()).pipe(
      catchError(() => EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((r: any) => {
      this.pendientes.set(Array.isArray(r) ? r : (r?.content ?? []));
      this.notifLoading.set(false);
    });
  }

  toggleNotif(): void  { this.notifOpen.update(v => !v); }
  closeNotif(): void   { this.notifOpen.set(false); }

  toggleThemePanel(): void { this.themeOpen.update(v => !v); }
  closeThemePanel(): void  { this.themeOpen.set(false); }

  selectTheme(id: ThemeId): void {
    this.theme.setTheme(id);
    this.closeThemePanel();
  }

  logout(): void { this.auth.logout(); }

  getInitials(name: string): string {
    return (name || 'U').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  private _canVerPendientes(): boolean {
    const roles = this.auth.session?.authorities ?? [];
    return roles.includes('ROLE_CAJERO') || roles.includes('ROLE_CAJERO_SUP') || roles.includes('ROLE_ADMIN');
  }

  private _codSucursal(): number {
    const roles = this.auth.session?.authorities ?? [];
    return (roles.includes('ROLE_CAJERO') || roles.includes('ROLE_CAJERO_SUP'))
      ? (this.auth.session?.codSucursal ?? 0)
      : 0;
  }
}
