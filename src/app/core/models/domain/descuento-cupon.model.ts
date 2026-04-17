import { Alianza } from './alianza.model';
import { Influencer } from './influencer.model';
export interface DescuentoCupon {
  influencer?: Influencer;
  alianza?: Alianza;
  cupon: string;
  descuento: number;
}
