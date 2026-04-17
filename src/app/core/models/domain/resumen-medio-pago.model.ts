export interface ResumenMedioPago {
  codMedioPago: number;
  cantCobranzas: number;
  codSucursal: number;
  codUsuario: number;
  importeCobrado: number;
  medioPago: string;
  nombrePersona: string;
  nombreSucursal: string;
}

export interface ResumenCanal {
  codCanal: number;
  nombreCanal: string;
  cantidadClientes: number;
  totalImporte: number;
}
