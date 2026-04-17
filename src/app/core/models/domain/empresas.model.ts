import { TipoNegocio } from './tipo-negocio.model';
export interface Empresas {
  codEmpresa: number;
  codEmpresaErp: string;
  img: string;
  maxDescuentoImp: number;
  maxDescuentoPorc: number;
  cantItem: number;
  razonSocial: string;
  actividad1: string;
  actividad2: string;
  ruc: string;
  tipoNegocio: TipoNegocio;
  logoReporte: string;
  logoHeaderDark: string;
  logoHeaderLight: string;
  logoTextLight: string;
  logoTextDark: string;
}
