import { Alianza } from './alianza.model';
export interface Cupon {
  codCupon: number;
  codEmpresa: number;
  alianza: Alianza;
  activo: boolean;
  cupon: string;
  qr: string;
  descuento: number;
  fechaVencimiento: Date;
  nroDoc: string;
  razonSocial: string;
  nroDocUs: string;
  razonSocialUs: string;
}
