import { Producto } from './producto.model';
import { Transferencia } from './transferencia.model';
import { UnidadMedida } from './unidadMedida.model';

export class TransferenciaDetalle {
    public codTransferenciaDetalle: number;
    public transferencia: Transferencia;
    public producto: Producto;
    public unidadMedida: UnidadMedida;
    public nroItem: number;
    public cantidadTransferencia: number;
    public emisorInicio: number;
    public emisorFin: number;
    public receptorInicio: number;
    public receptorFin: number;
         constructor(    ) { }
    }