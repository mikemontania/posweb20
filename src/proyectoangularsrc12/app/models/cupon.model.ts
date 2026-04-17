import { Alianza } from "./alianza.model";


export class Cupon {
        //  ? significa opcional
        public codCupon: number;
        public codEmpresa: number;
        public alianza: Alianza;
        public activo: boolean;
        public cupon: string;
        public qr: string;
        public descuento: number;
        public fechaVencimiento: Date;
        public nroDoc: string;
        public razonSocial: string;
        public nroDocUs: string;
        public razonSocialUs: string;
        constructor() { }

}