
export class Vehiculo {
            public codVehiculo: number;
            public codVehiculoErp: string;
            public codEmpresa: number;
            public nroChasis: string;
            public modelo: string;
            public nroChapa: string;
            public marca: string;
            public color: string;
            public combustible: string;
            public transmision: string;
            public codUltimoReparto: number;
            public activo?: boolean;
            public fechaCreacion?: string;
            public fechaModificacion?: string;
            public concatMarcaModeloChasis?: string;
            public concatMarcaModeloChapa?: string;
            constructor() { }
    }