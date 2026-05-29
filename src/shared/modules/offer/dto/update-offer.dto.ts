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
import {
  MIN_CONVENIENCES_COUNT,
  OfferDescription,
  OfferGuest,
  OfferImage,
  OfferPrice,
  OfferRoom,
  OfferTitle
} from '../offer.constant.js';

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: OfferValidationMessages.title.invalidFormat })
  @Length(OfferTitle.MIN_LENGTH, OfferTitle.MAX_LENGTH, { message: OfferValidationMessages.title.lengthField })
  public title?: string;

  @IsOptional()
  @IsString({ message: OfferValidationMessages.description.invalidFormat })
  @Length(OfferDescription.MIN_LENGTH, OfferDescription.MAX_LENGTH, { message: OfferValidationMessages.description.lengthField })
  public description?: string;

  @IsOptional()
  @IsEnum(CityName, { message: OfferValidationMessages.city.invalidFormat })
  public city?: string;

  @IsOptional()
  @IsUrl({}, { message: OfferValidationMessages.previewUrl.invalidFormat })
  public previewUrl?: string;

  @IsOptional()
  @IsArray({ message: OfferValidationMessages.images.invalidFormat })
  @ArrayMinSize(OfferImage.MIN_COUNT, { message: OfferValidationMessages.images.countField })
  @ArrayMaxSize(OfferImage.MAX_COUNT, { message: OfferValidationMessages.images.countField })
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
  @Min(OfferRoom.MIN, { message: OfferValidationMessages.roomsCount.rangeField })
  @Max(OfferRoom.MAX, { message: OfferValidationMessages.roomsCount.rangeField })
  public roomsCount?: number;

  @IsOptional()
  @IsInt({ message: OfferValidationMessages.guestsCount.invalidFormat })
  @Min(OfferGuest.MIN, { message: OfferValidationMessages.guestsCount.rangeField })
  @Max(OfferGuest.MAX, { message: OfferValidationMessages.guestsCount.rangeField })
  public guestsCount?: number;

  @IsOptional()
  @IsInt({ message: OfferValidationMessages.price.invalidFormat })
  @Min(OfferPrice.MIN, { message: OfferValidationMessages.price.rangeField })
  @Max(OfferPrice.MAX, { message: OfferValidationMessages.price.rangeField })
  public price?: number;

  @IsOptional()
  @IsArray({ message: OfferValidationMessages.conveniences.invalidFormat })
  @ArrayMinSize(MIN_CONVENIENCES_COUNT, { message: OfferValidationMessages.conveniences.invalidFormat })
  @IsEnum(Convenience, { each: true, message: OfferValidationMessages.conveniences.invalidFormatElement })
  public conveniences?: Convenience[];

  @IsOptional()
  @ValidateNested({ message: OfferValidationMessages.coordinates.invalidFormat })
  @Type(() => CoordinatesDto)
  public coordinates?: Coordinates;
}
