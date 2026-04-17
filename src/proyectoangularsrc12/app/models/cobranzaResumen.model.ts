


export class CobranzaResumen {
    //  ? significa opcional
        constructor(
            public codCliente: number,
            public codCobranza: number,
            public codMedioPago: number,
            public codVenta: number,
            public fechaVenta: string,
            public importeCobrado: number,
            public medioPago: string,
            public nroComprobante: string,
            public razonSocial: string,
            public ruc: string
                    ) { }
    }
 