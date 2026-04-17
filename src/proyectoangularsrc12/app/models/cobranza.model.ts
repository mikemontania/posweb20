
import { CobranzaDetalle } from './cobranzaDetalles.model';

export class Cobranza {
    //  ? significa opcional
        constructor(
            public anulado: boolean,
            public codCobranza: number,
            public importeCobrado: number,
            public importeAbonado: number,
            public fechaCobranza: string,
            public saldo: number,
            public detalle: CobranzaDetalle[],
            public tipo: string,

        ) { }
    }
