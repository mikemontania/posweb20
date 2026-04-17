// ============================================================
//  M2POS — Environments
//  Buenas prácticas:
//  • Un solo objeto tipado por entorno (Environment interface)
//  • Nunca hardcodear URLs en servicios: siempre inject(APP_CONFIG)
//  • Para secrets usa variables de CI/CD, nunca los subas al repo
//  • ng build --configuration=production  → usa environment.prod.ts
//  • ng build --configuration=staging     → usa environment.staging.ts
// ============================================================

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  envName: 'development',

  // ── API Principal ──────────────────────────────────────────
  // DEV  (activo)
  apiBaseUrl: 'https://mposdev.mobile.com.py/mpos/rest/',

  // LOCAL — descomentar para desarrollo local
  // apiBaseUrl: 'http://localhost:8080/rest/',

  // STAGING — servidor de pruebas/QA
  // apiBaseUrl: 'https://mposstg.mobile.com.py/mpos/rest/',

  // PRODUCCIÓN Mobile
  // apiBaseUrl: 'https://mpos.mobile.com.py/mpos/rest/',

  // PRODUCCIÓN Cavallaro
  // apiBaseUrl: 'https://pos.cavallaro.com.py/mpos/rest/',

  // ── ABI (integración externa) ──────────────────────────────
  // DEV / Staging ABI
  abiBaseUrl: 'https://abi.softec.com.py/backoffice/api/v1/fab',

  // PRODUCCIÓN ABI
  // abiBaseUrl: 'https://app.abi.com.py/backoffice/api/v1/fab',

  // Token ABI — en prod moverlo a variable de entorno CI/CD
  abiToken: 'c97f2cac94c143d4907cd44c1ffe33836e0f6c3f',

  // ── Driver Balanza (servicio local del cliente) ────────────
  // Siempre localhost — este servicio corre en la máquina del cajero
  balanzaUrl: 'http://localhost:3000/api',

  // ── Feature flags ─────────────────────────────────────────
  enableDevTools: true,
  enableServiceWorker: false,
};
