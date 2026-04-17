export interface Sucursal {
  codSucursal: number;
  codSucursalErp: string;
  nombreSucursal: string;
  direccion: string;
  principal: boolean;
  codEmpresa: number;
  modoVendedor: string;
  latitud: number;
  longitud: number;
  envioposventa: boolean;
  mensaje: string;
  telefono?: string;
  email?: string;
  centro?: string;
}
