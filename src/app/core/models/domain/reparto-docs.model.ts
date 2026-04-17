import { Pedido } from './pedido.model';
import { Venta } from './venta.model';
import { Cliente } from './cliente.model';
export interface RepartoDocs {
  codRepartoDocs: number;
  venta: Venta;
  pedido: Pedido;
  cliente: Cliente;
  reparto: any;
  totalKg: number;
  totalGs: number;
  docNro: string;
  tipo: string;
  fechaReparto: string;
  latitud: number;
  longitud: number;
  orden: number;
}
export interface Marcador {
  codRepartoDocs: number;
  codCliente: number;
  codVenta: number;
  codReparto: number;
  entregado: boolean;
  importe: number;
  comprobante: string;
  razonSocial: string;
  docNro: string;
  direccion: string;
  telefono: string;
  latitud: number;
  longitud: number;
  orden: number;
  distancia: number;
}
