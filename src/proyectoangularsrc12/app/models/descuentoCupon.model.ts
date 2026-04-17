import { Alianza } from "./alianza.model";
import { Influencer } from './influencer.model';

 

export class DescuentoCupon {
        //  ? significa opcional 
        public influencer?: Influencer;
        public alianza?: Alianza;
        public cupon: string;
        public descuento: number;
        constructor() { }

}