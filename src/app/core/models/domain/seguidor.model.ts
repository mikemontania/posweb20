import { Cliente } from './cliente.model';
import { Influencer } from './influencer.model';
export interface Seguidor {
  codSeguidor: number;
  codEmpresa: number;
  influencer: Influencer;
  cupon: string;
  descuento: number;
  totalImporte: number;
  nroComprobante: string;
  cliente: Cliente;
  codVenta: number;
  fechaVencimiento: Date;
  nroDoc: string;
  razonSocial: string;
  nroDocUs: string;
  razonSocialUs: string;
}
