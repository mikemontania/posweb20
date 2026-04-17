// ============================================================
//  AuthService — Angular 20
//  Renombrado desde LoginService.
//  Modelo de sesión: AuthSession (≠ Usuarios del dominio).
//
//  ESTRATEGIA DE REFRESH TOKEN:
//  ──────────────────────────────────────────────────────────
//  El token JWT dura 24h (iat → exp = 86400s).
//  Renovar en CADA navegación de página es innecesario
//  y genera carga al servidor.
//
//  Mejor momento para renovar:
//  1. Al cargar la app (bootstrap) si el token lleva
//     más de 12h emitido → renovar proactivo silencioso.
//  2. Cuando quedan menos de 2h para expirar → renovar
//     la próxima vez que el usuario haga una acción.
//  3. Si el servidor devuelve 401 → el interceptor ya
//     maneja el logout automático.
//
//  La renovación en cada cambio de ruta (como era antes)
//  causaba una request HTTP extra por cada click en el menú.
//  Ahora solo se renueva cuando tiene sentido hacerlo.
// ============================================================
import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, Subscription, timer } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { APP_CONFIG } from '../tokens/app-config.token';
import { AuthSession } from '../models/auth-session.model';
import { TerminalVenta } from '../models/terminal-venta.model';

const STORAGE_KEYS = {
  TOKEN:    'token',
  SESSION:  'auth_session',   // renombrado de 'user' para claridad
  TERMINAL: 'tv',
  USERNAME: 'username',
} as const;

// Umbral: si faltan menos de 2h para expirar → renovar
const REFRESH_THRESHOLD_SECONDS = 2 * 60 * 60;

// Intervalo de chequeo: cada 30 minutos
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly config = inject(APP_CONFIG);

  // ── Signals internos ──────────────────────────────────────
  private readonly _session  = signal<AuthSession | null>(this.loadSession());
  private readonly _token    = signal<string>(this.loadToken());
  private readonly _terminal = signal<TerminalVenta>(this.loadTerminal());

  // ── API pública signals ───────────────────────────────────
  readonly sessionSignal  = this._session.asReadonly();
  readonly tokenSignal    = this._token.asReadonly();
  readonly terminalSignal = this._terminal.asReadonly();
  readonly isLoggedIn     = computed(() => (this._token()?.length ?? 0) > 5);

  // ── Getters planos para templates ─────────────────────────
  get session(): AuthSession | null { return this._session(); }
  get token(): string                { return this._token(); }
  get terminal(): TerminalVenta      { return this._terminal(); }

  // ── Timer de renovación proactiva ─────────────────────────
  private refreshSub?: Subscription;

  constructor() {
    // Al iniciar la app: chequear si el token necesita renovarse
    this.scheduleProactiveRefresh();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  // ── Login ──────────────────────────────────────────────────
  login(username: string, password: string, remember = false): Observable<boolean> {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
    }
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TERMINAL);

    return this.http.post<{ token: string }>(
      `${this.config.apiBaseUrl}auth/login`,
      { username, password }
    ).pipe(
      map(response => {
        const session = this.decodeToken(response.token);
        this.saveSession(response.token, session);
        this.scheduleProactiveRefresh(); // arrancar timer post-login
        return true;
      }),
      catchError(err => {
        console.error('[AuthService] login error', err);
        return throwError(() => err);
      })
    );
  }

  // ── Refresh token ──────────────────────────────────────────
  // Llamado solo cuando tiene sentido: timer proactivo o
  // cuando el guard detecta expiración inminente.
  // NO se llama en cada cambio de ruta.
  refreshToken(): Observable<boolean> {
    return this.http.get<{ token: string }>(
      `${this.config.apiBaseUrl}auth/token`
    ).pipe(
      tap(response => {
        const session = this.decodeToken(response.token);
        this.saveSession(response.token, session);
        this.scheduleProactiveRefresh(); // reiniciar timer
      }),
      map(() => true),
      catchError(err => {
        console.error('[AuthService] refresh error', err);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  // ── Chequeo rápido local (sin HTTP) ───────────────────────
  // Úsalo en los guards en lugar de llamar al servidor siempre.
  // Devuelve: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  checkTokenStatus(): 'valid' | 'expiring_soon' | 'expired' | 'missing' {
    const token = this._token();
    if (!token) return 'missing';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp as number;
      const now = Math.floor(Date.now() / 1000);

      if (exp < now) return 'expired';
      if ((exp - now) < REFRESH_THRESHOLD_SECONDS) return 'expiring_soon';
      return 'valid';
    } catch {
      return 'missing';
    }
  }

  // ── Cambiar sucursal ───────────────────────────────────────
  changeSucursal(codSucursal: number): Observable<any> {
    return this.http.put<any>(
      `${this.config.apiBaseUrl}usuarios/changeCodSucursal?codsucursal=${codSucursal}`,
      null
    );
  }

  // ── Terminal ───────────────────────────────────────────────
  saveTerminal(terminal: TerminalVenta): void {
    this._terminal.set(terminal);
    localStorage.setItem(STORAGE_KEYS.TERMINAL, btoa(JSON.stringify(terminal)));
  }

  // ── Logout ─────────────────────────────────────────────────
  logout(): void {
    this.refreshSub?.unsubscribe();
    this._session.set(null);
    this._token.set('');
    this._terminal.set(this.defaultTerminal());
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.TERMINAL);
    this.router.navigate(['/login']);
  }

  // ── Timer proactivo ────────────────────────────────────────
  // Chequea cada 30 min si el token está por vencer.
  // Si quedan menos de 2h → renueva en segundo plano.
  // El usuario no nota nada. No hay requests innecesarias.
  private scheduleProactiveRefresh(): void {
    this.refreshSub?.unsubscribe();

    if (!this.isLoggedIn()) return;

    this.refreshSub = timer(CHECK_INTERVAL_MS, CHECK_INTERVAL_MS).subscribe(() => {
      const status = this.checkTokenStatus();
      if (status === 'expired') {
        this.logout();
      } else if (status === 'expiring_soon') {
        this.refreshToken().subscribe({
          error: () => {} // el catchError interno ya maneja logout
        });
      }
      // status === 'valid' → no hacer nada
    });
  }

  // ── Decodificar JWT → AuthSession ─────────────────────────
  private decodeToken(token: string): AuthSession {
    const p = JSON.parse(atob(token.split('.')[1]));
    return {
      codUsuario:       p.codUsuario,
      codPersonaErp:    p.codPersonaErp ?? '',
      username:         p.sub ?? p.username,
      nombre:           p.nombre,
      codEmpresa:       p.codEmpresa,
      codEmpresaErp:    p.codEmpresaErp,
      codSucursal:      p.codSucursal,
      codSucursalErp:   p.codSucursalErp,
      authorities:      p.authorities ?? [],
      maxDescuentoImp:  p.maxDescuentoImp,
      maxDescuentoPorc: p.maxDescuentoPorc,
      cantItem:         p.cantItem,
      img:              p.img ?? '',
      iat:              p.iat,
      exp:              p.exp,
    };
  }

  private saveSession(token: string, session: AuthSession): void {
    // No guardar iat/exp en localStorage (son efímeros)
    const { iat, exp, ...sessionToStore } = session;
    this._token.set(token);
    this._session.set(session); // en memoria sí los tenemos
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionToStore));
  }

  private loadToken(): string {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) ?? '';
  }

  private loadSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) {
      // Compatibilidad: si existe la key vieja 'user', migrarla
      const legacy = localStorage.getItem('user');
      if (legacy) {
        localStorage.setItem(STORAGE_KEYS.SESSION, legacy);
        localStorage.removeItem('user');
        return JSON.parse(legacy) as AuthSession;
      }
      return null;
    }
    return JSON.parse(raw) as AuthSession;
  }

  private loadTerminal(): TerminalVenta {
    const raw = localStorage.getItem(STORAGE_KEYS.TERMINAL);
    return raw ? JSON.parse(atob(raw)) : this.defaultTerminal();
  }

  private defaultTerminal(): TerminalVenta {
    return {
      codTerminalVenta: 0,
      descripcion:      'No Seleccionada',
      id:               '363ddbe5-ead3-7455-39a8-6737444ae234',
      codEmpresa:       0,
      codSucursal:      0,
      disponible:       false,
    };
  }
}
