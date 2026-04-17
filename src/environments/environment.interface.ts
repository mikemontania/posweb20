// Interfaz tipada — garantiza consistencia entre todos los entornos
export interface Environment {
  production: boolean;
  envName: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  abiBaseUrl: string;
  abiToken: string;
  balanzaUrl: string;
  enableDevTools: boolean;
  enableServiceWorker: boolean;
}
