import { Cliente } from "./cliente.model";

export class HistorialPunto {
            public codigo: number;
            public cliente: Cliente;
            public ultimoImporte: number;
            public nroComprobante: string;
            public fechaModificacion: string;
            constructor() { }
    }
