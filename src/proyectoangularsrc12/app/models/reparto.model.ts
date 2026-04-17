import { Chofer } from './chofer.model';
import { Vehiculo } from './vehiculo.model';
import { RepartoDetalle } from './repartoDetalle.model';
import { RepartoDocs } from './repartoDocs.model';

export class Reparto {

    constructor(
        public codReparto: number,
        public codEmpresa: number,
        public codSucursal: number,
        public anulado: boolean,
        public chofer: Chofer,
        public ayudante1: Chofer,
        public ayudante2: Chofer,
        public vehiculo: Vehiculo,
        public codUsuarioCreacion: number,
        public fechaReparto: string,
        public totalKg: number,
        public totalGs: number,
        public usuarioCreacion: string,
        public obs?: string,
        public documento?: RepartoDocs[],
        public detalle?: RepartoDetalle[],
        public fechaCreacion?: Date,
        public usuarioModificacion?: string,
        public fechaModificacion?: string,
    ) {

    }
}