export interface MedioPago {
  codMedioPago: number;
  codMedioPagoErp: string;
  codEmpresa: number;
  descripcion: string;
  tieneTipo: boolean;
  tieneRef: boolean;
  tieneBanco: boolean;
  esCheque: boolean;
  esObsequio: boolean;
}
