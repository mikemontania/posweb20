export interface Vehiculo {
  codVehiculo: number;
  codVehiculoErp: string;
  codEmpresa: number;
  nroChasis: string;
  modelo: string;
  nroChapa: string;
  marca: string;
  color: string;
  combustible: string;
  transmision: string;
  codUltimoReparto: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  concatMarcaModeloChasis?: string;
  concatMarcaModeloChapa?: string;
}
