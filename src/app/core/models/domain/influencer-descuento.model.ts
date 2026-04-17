import { Influencer } from './influencer.model';
export interface InfluencerDescuento {
  influencer?: Influencer;
  cantValidez: number;
  descuento: number;
}
