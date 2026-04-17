export class ResumenMedioPago {
        public codMedioPago: number;
        public cantCobranzas: number;
        public codSucursal: number;
        public codUsuario: number;
        public importeCobrado: number;
        public medioPago: string;
        public nombrePersona: string;
        public nombreSucursal: string;
            constructor() { }
    }

    export class ResumenCanal {
        public codCanal: number;
        public nombreCanal: string;
        public cantidadClientes: number;
        public totalImporte: number;
            constructor() { }
    }
