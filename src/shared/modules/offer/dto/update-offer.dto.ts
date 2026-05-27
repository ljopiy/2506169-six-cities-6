import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested
} from 'class-validator';
import { CityName, Convenience, OfferType, Coordinates } from '../../../types/index.js';
import { OfferValidationMessages } from './offer.messages.js';
import { CoordinatesDto } from './coordinates-offer.dto.js';

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: OfferValidationMessages.title.invalidFormat })
  @Length(10, 100, { message: OfferValidationMessages.title.lengthField })
  public title?: string;

  @IsOptional()
  @IsString({ message: OfferValidationMessages.description.invalidFormat })
  @Length(20, 1024, { message: OfferValidationMessages.description.lengthField })
  public description?: string;

  @IsOptional()
  @IsEnum(CityName, { message: OfferValidationMessages.city.invalidFormat })
  public city?: string;

  @IsOptional()
  @IsUrl({}, { message: OfferValidationMessages.previewUrl.invalidFormat })
  public previewUrl?: string;

  @IsOptional()
  @IsArray({ message: OfferValidationMessages.images.invalidFormat })
  @ArrayMinSize(6, { message: OfferValidationMessages.images.countField })
  @ArrayMaxSize(6, { message: OfferValidationMessages.images.countField })
  @IsUrl({}, { each: true, message: OfferValidationMessages.images.invalidFormat })
  public images?: string[];

  @IsOptional()
  @IsBoolean({ message: OfferValidationMessages.isPremium.invalidFormat })
  public isPremium?: boolean;

  @IsOptional()
  @IsEnum(OfferType, { message: OfferValidationMessages.type.invalidFormat })
  public type?: OfferType;

  @IsOptional()
  @IsInt({ message: OfferValidationMessages.roomsCount.invalidFormat })
  @Min(1, { message: OfferValidationMessages.roomsCount.rangeField })
  @Max(8, { message: OfferValidationMessages.roomsCount.rangeField })
  public roomsCount?: number;

  @IsOptional()
  @IsInt({ message: OfferValidationMessages.guestsCount.invalidFormat })
  @Min(1, { message: OfferValidationMessages.guestsCount.rangeField })
  @Max(10, { message: OfferValidationMessages.guestsCount.rangeField })
  public guestsCount?: number;

  @IsOptional()
  @IsInt({ message: OfferValidationMessages.price.invalidFormat })
  @Min(100, { message: OfferValidationMessages.price.rangeField })
  @Max(100000, { message: OfferValidationMessages.price.rangeField })
  public price?: number;

  @IsOptional()
  @IsArray({ message: OfferValidationMessages.conveniences.invalidFormat })
  @ArrayMinSize(1, { message: OfferValidationMessages.conveniences.invalidFormat })
  @IsEnum(Convenience, { each: true, message: OfferValidationMessages.conveniences.invalidFormat })
  public conveniences?: Convenience[];

  @IsOptional()
  @ValidateNested({ message: OfferValidationMessages.coordinates.invalidFormat })
  @Type(() => CoordinatesDto)
  public coordinates?: Coordinates;
}
