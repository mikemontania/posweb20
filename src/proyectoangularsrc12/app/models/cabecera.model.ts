import { Cliente } from './cliente.model';

export class Cabecera {
    //  ? significa opcional
        constructor(
            public cod: number,
            public cliente: Cliente,
            public fecha: string,
            public total: number
        ) { }
    
    }
    