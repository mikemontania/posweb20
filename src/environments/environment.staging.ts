import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  envName: 'staging',

  // STAGING — QA / Testing
  apiBaseUrl: 'https://mposstg.mobile.com.py/mpos/rest/',

  // DEV — fallback
  // apiBaseUrl: 'https://mposdev.mobile.com.py/mpos/rest/',

  // ABI Staging
  abiBaseUrl: 'https://abi.softec.com.py/backoffice/api/v1/fab',

  // ABI PROD
  // abiBaseUrl: 'https://app.abi.com.py/backoffice/api/v1/fab',

  abiToken: 'c97f2cac94c143d4907cd44c1ffe33836e0f6c3f',

  // Balanza — siempre local
  balanzaUrl: 'http://localhost:3000/api',

  enableDevTools: true,
  enableServiceWorker: false,
};
