import { Cliente } from "./cliente.model";
import { Influencer } from "./influencer.model";


export class Seguidor {
        //  ? significa opcional
        public codSeguidor: number;
        public codEmpresa: number;
        public influencer: Influencer;
        public cupon: string;
        public descuento: number;
        public totalImporte: number;
        public nroComprobante: string;
        public cliente: Cliente;
        public codVenta: number;
        public fechaVencimiento: Date;
        public nroDoc: string;
        public razonSocial: string;
        public nroDocUs: string;
        public razonSocialUs: string;
        constructor() { }

} 