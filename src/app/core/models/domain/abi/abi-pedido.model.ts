export interface ABI_ProductoPedido {
  id: number;
  nombre: string;
  imagen_portada: string;
  cantidad: number;
  precio: number;
}
export interface ABI_Pedido {
  id: number;
  referencia: string;
  fecha: string;
  fecha_aceptado: string;
  fecha_entrega: string;
  precio_mejorado: boolean;
  estado: number;
  productos: ABI_ProductoPedido[];
  contrasena: string;
}
