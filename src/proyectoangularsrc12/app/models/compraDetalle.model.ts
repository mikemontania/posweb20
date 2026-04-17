import { Compra } from './compra.model';
import { Deposito } from './deposito.model';
import { Producto } from './producto.model';
 import { UnidadMedida } from './unidadMedida.model';

 
export class CompraDetalle {
    public codCompraDetalle: number;
    public nroItem: number;
    public cantidad: number;
    public importeDescuento: number;
    public importeIva5: number;
    public importeIva10: number;
    public importeIvaExenta: number;
    public importeNeto: number;
    public importePrecio: number;
    public importeTotal: number;
    public subTotal: number;
    public porcDescuento: number;
    public porcIva: number;
    public producto: Producto;
    public unidadMedida: UnidadMedida;
    public compra: Compra;
    public deposito: Deposito;
         constructor(
          /*   public codCompraDetalle: number;
            public nroItem: number;
            public cantidad: number;
            public importeDescuento: number;
            public importeIva5: number;
            public importeIva10: number;
            public importeIvaExenta: number;
            public importeNeto: number;
            public importePrecio: number;
            public importeTotal: number;
            public subTotal: number;
            public porcDescuento: number;
            public porcIva: number;
            public producto: Producto;
            public unidadMedida: UnidadMedida;
            public compra: Compra;
            public deposito: Deposito */
        ) { }
    }