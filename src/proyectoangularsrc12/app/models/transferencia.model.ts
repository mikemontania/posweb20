import { Deposito } from './deposito.model';
import { MotivoTransferencia } from './motivoTransferencia.model';
import { TransferenciaDetalle } from './transferenciaDetalle.model';
export class Transferencia {
         constructor(
           public codTransferencia: number,
           public anulado: boolean,
           public codEmpresa: number,
           public codUsuarioCreacion: number,
           public usuario: string,
            public fechaCreacion: Date,
            public fecha: string,
            public fechaModificacion: string,
            public nroComprobante: string,
            public depositoEmisor: Deposito,
            public depositoReceptor: Deposito,
            public totalProducto: number,
            public totalTransferencia: number,
            public motivoTransferencia: MotivoTransferencia,
           public detalle: TransferenciaDetalle[],
        ) { }
    }
