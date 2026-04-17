// ============================================================
//  Guards funcionales — Angular 20
//
//  CAMBIO CLAVE respecto a la versión anterior:
//  - authGuard ya NO llama refreshToken() en cada ruta.
//    Solo verifica el estado local del token (sin HTTP).
//    La renovación proactiva la maneja el timer de AuthService.
//  - tokenExpiryGuard renueva solo si está por vencer (<2h)
//    y solo UNA VEZ por sesión de vida del token gracias al timer.
//  - canMatchGuard es la puerta más liviana: solo verifica
//    que el token existe y no está expirado.
// ============================================================
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

// ── authGuard: verifica sesión activa (sin HTTP) ──────────
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const status = auth.checkTokenStatus();

  if (status === 'missing' || status === 'expired') {
    if (status === 'expired') auth.logout();
    else router.navigateByUrl('/login');
    return false;
  }

  // 'valid' o 'expiring_soon' → dejar pasar
  // El timer de AuthService se encarga del refresh en background
  return true;
};

// ── canMatchGuard: guard liviano para lazy routes ─────────
export const canMatchGuard: CanMatchFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};

// ── loginGuard: redirige al dashboard si ya está logueado ─
export const loginGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const status = auth.checkTokenStatus();
  if (status === 'valid' || status === 'expiring_soon') {
    router.navigateByUrl('/dashboard');
    return false;
  }
  return true;
};

// ── tokenExpiryGuard: solo para rutas que necesitan token  ─
// fresco (ej: nueva venta, confirmar pago).               ─
// En rutas de listados no hace falta — usar authGuard.    ─
export const tokenExpiryGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const status = auth.checkTokenStatus();

  if (status === 'missing') {
    router.navigateByUrl('/login');
    return false;
  }

  if (status === 'expired') {
    auth.logout();
    return false;
  }

  if (status === 'expiring_soon') {
    // Renueva y deja pasar — no bloquea la navegación
    return auth.refreshToken().pipe(
      map(() => true),
      catchError(() => of(true)) // si falla el refresh, igual deja pasar
    );
  }

  return true; // 'valid'
};
