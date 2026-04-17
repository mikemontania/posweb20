
import { Canje } from './canje.model';
import { Premio } from './premio.model ';

export class CanjeDet {
    //  ? significa opcional
        constructor(
            public codCanjeDet: number,
            public premio: Premio,
            public cantidad: number,
            public puntos: number,
            public totalPuntos: number,
            public canje: Canje
        ) { }
    }
