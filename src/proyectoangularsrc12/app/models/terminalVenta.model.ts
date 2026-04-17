export class TerminalVenta {
    //  ? significa opcional
        constructor(
            public codTerminalVenta: number,
            public codEmpresa: number,
            public codSucursal: number,
            public id: string,
            public descripcion: string,
            public disponible: boolean,

        ) { }
    }
