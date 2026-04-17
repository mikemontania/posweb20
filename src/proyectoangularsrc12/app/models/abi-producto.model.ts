import { ABI_Imagenes } from './abi-imagenes.model';

export class ABI_Producto {
                public id: number;
                public descripcion: string;
                public categoria: number;
                public nombre: string;
                public descripcion_extensa: string;
                public etiquetas: string;
                public cantidad_mayorista: number;
                public precio: number;
                public precio_mayorista: number;
                public cantidad_disponible: number;
                public peso_kg: number;
                public ancho_cm: number;
                public profundidad_cm: number;
                public refrigeracion: number;
                public fabricante: number;
                public activo: boolean;
                public api_extra_data: string;
                public imagenes:ABI_Imagenes[] 
        constructor() {}
    }
     