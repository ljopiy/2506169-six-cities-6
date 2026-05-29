import {
  IsDefined,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { Coordinates } from '../../../types/index.js';
import { OfferValidationMessages } from './offer.messages.js';
import { OfferCoordinates } from '../offer.constant.js';

export class CoordinatesDto implements Coordinates {
  @IsDefined({ message: OfferValidationMessages.latitude.requiredField })
  @IsNumber({}, { message: OfferValidationMessages.latitude.invalidFormat })
  @Min(OfferCoordinates.LATITUDE_MIN, { message: OfferValidationMessages.latitude.rangeField })
  @Max(OfferCoordinates.LATITUDE_MAX, { message: OfferValidationMessages.latitude.rangeField })
  public latitude!: number;

  @IsDefined({ message: OfferValidationMessages.longitude.requiredField })
  @IsNumber({}, { message: OfferValidationMessages.longitude.invalidFormat })
  @Min(OfferCoordinates.LONGITUDE_MIN, { message: OfferValidationMessages.longitude.rangeField })
  @Max(OfferCoordinates.LONGITUDE_MAX, { message: OfferValidationMessages.longitude.rangeField })
  public longitude!: number;
}
