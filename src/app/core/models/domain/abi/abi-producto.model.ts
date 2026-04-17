import { ABI_Imagenes } from './abi-imagenes.model';
export interface ABI_Producto {
  id: number;
  descripcion: string;
  categoria: number;
  nombre: string;
  descripcion_extensa: string;
  etiquetas: string;
  cantidad_mayorista: number;
  precio: number;
  precio_mayorista: number;
  cantidad_disponible: number;
  peso_kg: number;
  ancho_cm: number;
  profundidad_cm: number;
  refrigeracion: number;
  fabricante: number;
  activo: boolean;
  api_extra_data: string;
  imagenes: ABI_Imagenes[];
}
