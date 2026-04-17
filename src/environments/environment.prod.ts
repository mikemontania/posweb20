import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  envName: 'production',

  // PRODUCCIÓN Mobile (principal)
  apiBaseUrl: 'https://mpos.mobile.com.py/mpos/rest/',

  // PRODUCCIÓN Cavallaro
  // apiBaseUrl: 'https://pos.cavallaro.com.py/mpos/rest/',

  // DEV — NUNCA usar en prod, solo referencia
  // apiBaseUrl: 'https://mposdev.mobile.com.py/mpos/rest/',

  // LOCAL — NUNCA usar en prod
  // apiBaseUrl: 'http://localhost:8080/rest/',

  // ABI PRODUCCIÓN
  abiBaseUrl: 'https://app.abi.com.py/backoffice/api/v1/fab',

  // ABI DEV/Staging
  // abiBaseUrl: 'https://abi.softec.com.py/backoffice/api/v1/fab',

  // IMPORTANTE: en prod este token debería venir de CI/CD
  // Configura ANGULAR_ABI_TOKEN en tu pipeline y usa:
  // abiToken: process.env['ANGULAR_ABI_TOKEN'] ?? ''
  abiToken: 'c97f2cac94c143d4907cd44c1ffe33836e0f6c3f',

  // Balanza — siempre localhost (servicio local del cliente)
  balanzaUrl: 'http://localhost:3000/api',

  enableDevTools: false,
  enableServiceWorker: true,
};
