 
import { CompraDetalle } from './compraDetalle.model';
import { MotivoAnulacion } from './motivoAnulacion.model';
import { Proveedor } from './proveedor.model';

export class Compra {
    //  ? significa opcional

/*     public codCompra: number,
    public anulado: boolean,
   public codEmpresa: number,
    public estado: string,
   public fechaAnulacion: Date,
   public fechaCreacion: Date,
   public fechaVencimiento: Date,
   public fechaCompra: string,
   public fechaModificacion: string,
   public porcDescuento: number,
   public importeDescuento: number,
   public importeIva5: number,
   public importeIva10: number,
   public importeIvaExenta: number,
   public importeNeto: number,
   public importeTotal: number,
   public subTotal: number,
   public timbrado: string,
   public inicioTimbrado: string,
   public finTimbrado: string,
   public codUsuarioAnulacion: number,
   public nroComprobante: string,
   public tipoComprobante: string,
    public codUsuarioCreacion: number,
   public proveedor: Proveedor,
   public detalle: CompraDetalle[],
   public motivoAnulacion: MotivoAnulacion, */
        constructor(
            public codCompra: number,
            public anulado: boolean,
           public codEmpresa: number,
            public estado: string,
           public fechaAnulacion: Date,
           public fechaCreacion: Date,
           public fechaVencimiento: Date,
           public fechaCompra: string,
           public fechaModificacion: string,
           public porcDescuento: number,
           public importeDescuento: number,
           public importeIva5: number,
           public importeIva10: number,
           public importeIvaExenta: number,
           public importeNeto: number,
           public importeTotal: number,
           public subTotal: number,
           public timbrado: string,
           public inicioTimbrado: string,
           public finTimbrado: string,
           public codUsuarioAnulacion: number,
           public nroComprobante: string,
           public tipoComprobante: string,
            public codUsuarioCreacion: number,
           public proveedor: Proveedor,
           public detalle: CompraDetalle[],
           public motivoAnulacion: MotivoAnulacion,

        ) { }
    }
