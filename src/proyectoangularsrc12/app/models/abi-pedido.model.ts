import { ABI_Producto_Pedido } from './abi-producto-pedido.model';

 

export class ABI_Pedido {
    //  ? significa opcional
        constructor(
            public id: number,
            public referencia: string,
            public fecha: string,
            public fecha_aceptado: string,
            public fecha_entrega: string,
             public precio_mejorado: boolean,
             public estado: number,          
            public  productos: ABI_Producto_Pedido[],
            public contrasena: string,
        ) { }
    }
 