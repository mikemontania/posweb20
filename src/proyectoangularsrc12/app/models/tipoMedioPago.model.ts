import { MedioPago } from './medioPago.model';

export class TipoMedioPago {
    //  ? significa opcional
            public codTipoMedioPago: number;
            public codTipoMedioPagoErp: string;
            public descripcion: string;
            public codEmpresa: number;
            public medioPago: MedioPago;
            constructor( ) { }
    }
