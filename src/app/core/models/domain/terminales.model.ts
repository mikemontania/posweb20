export interface Terminales {
  codTerminalVenta: number;
  descripcion: string;
  id: string;
  codSucursal: number;
  codEmpresa: number;
  disponible: boolean;
  sucursal?: { nombreSucursal?: string };
}
