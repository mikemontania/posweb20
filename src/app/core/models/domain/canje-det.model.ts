import { Premio } from './premio.model';
export interface CanjeDet {
  codCanjeDet: number;
  premio: Premio;
  cantidad: number;
  puntos: number;
  totalPuntos: number;
  canje: any; // circular
}
