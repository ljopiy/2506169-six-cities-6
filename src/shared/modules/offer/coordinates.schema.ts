import { prop } from '@typegoose/typegoose';
import { OfferCoordinates } from './offer.constant.js';

export class CoordinatesSchema {
  @prop({
    required: true,
    type: () => Number,
    min: OfferCoordinates.LATITUDE_MIN,
    max: OfferCoordinates.LATITUDE_MAX
  })
  public latitude!: number;

  @prop({
    required: true,
    type: () => Number,
    min: OfferCoordinates.LONGITUDE_MIN,
    max: OfferCoordinates.LONGITUDE_MAX
  })
  public longitude!: number;
}
