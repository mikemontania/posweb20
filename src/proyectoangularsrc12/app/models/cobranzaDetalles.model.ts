
import { MedioPago } from './medioPago.model';
import { TipoMedioPago } from './tipoMedioPago.model';
import { Bancos } from './bancos.model';


export class CobranzaDetalle {
    //  ? significa opcional
        constructor(
            public codCobranzaDetalle: number,
            public importeAbonado: number,
            public importeCobrado: number,
            public saldo: number,
            public medioPago: MedioPago,
            public tipoMedioPago: TipoMedioPago,
            public fechaEmision: string,
            public fechaVencimiento: string,
            public nroRef: string,
            public banco: Bancos,
            public nroCuenta: string
                    ) { }
    }
