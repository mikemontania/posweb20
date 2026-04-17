export interface Proveedor {
  codProveedor: number;
  codProveedorErp: string;
  codEmpresa: number;
  codUltimaCompra: number;
  docNro: string;
  tipoDoc: string;
  razonSocial: string;
  alias?: string;
  direccion?: string;
  email?: string;
  obs?: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  concatDocNombre?: string;
  concatCodNombre?: string;
  concatCodErpNombre?: string;
}
