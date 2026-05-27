import {
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { Coordinates } from '../../../types/index.js';
import { OfferValidationMessages } from './offer.messages.js';

export class CoordinatesDto implements Coordinates {
  @IsNumber({}, { message: OfferValidationMessages.latitude.invalidFormat })
  @Min(-90, { message: OfferValidationMessages.latitude.rangeField })
  @Max(90, { message: OfferValidationMessages.latitude.rangeField })
  public latitude!: number;

  @IsNumber({}, { message: OfferValidationMessages.longitude.invalidFormat })
  @Min(-180, { message: OfferValidationMessages.longitude.rangeField })
  @Max(180, { message: OfferValidationMessages.longitude.rangeField })
  public longitude!: number;
}
