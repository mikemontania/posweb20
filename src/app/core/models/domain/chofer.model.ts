export interface Chofer {
  codChofer: number;
  codChoferErp: string;
  codEmpresa: number;
  chofer: string;
  docNro: string;
  tipoLicencia: string;
  licencia: string;
  codUltimoReparto: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  concatDocChofer?: string;
}
