import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEnum,
  IsInt,
  IsMongoId,
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
  MIN_COMMENTS_COUNT,
  MIN_CONVENIENCES_COUNT,
  OfferGuest,
  OfferImage,
  OfferPrice,
  OfferRating,
  OfferRoom,
  OfferTitle,
  OfferDescription
} from '../offer.constant.js';

export class CreateOfferDto {
  @IsDefined({ message: OfferValidationMessages.title.requiredField })
  @IsString({ message: OfferValidationMessages.title.invalidFormat })
  @Length(OfferTitle.MIN_LENGTH, OfferTitle.MAX_LENGTH, { message: OfferValidationMessages.title.lengthField })
  public title!: string;

  @IsDefined({ message: OfferValidationMessages.description.requiredField })
  @IsString({ message: OfferValidationMessages.description.invalidFormat })
  @Length(OfferDescription.MIN_LENGTH, OfferDescription.MAX_LENGTH, { message: OfferValidationMessages.description.lengthField })
  public description!: string;

  @IsDefined({ message: OfferValidationMessages.postDate.requiredField })
  @IsDateString({}, { message: OfferValidationMessages.postDate.invalidFormat })
  public postDate!: Date;

  @IsDefined({ message: OfferValidationMessages.city.requiredField })
  @IsEnum(CityName, { message: OfferValidationMessages.city.invalidFormat })
  public city!: string;

  @IsDefined({ message: OfferValidationMessages.previewUrl.requiredField })
  @IsUrl({}, { message: OfferValidationMessages.previewUrl.invalidFormat })
  public previewUrl!: string;

  @IsDefined({ message: OfferValidationMessages.images.requiredField })
  @IsArray({ message: OfferValidationMessages.images.invalidFormat })
  @ArrayMinSize(OfferImage.MIN_COUNT, { message: OfferValidationMessages.images.countField })
  @ArrayMaxSize(OfferImage.MAX_COUNT, { message: OfferValidationMessages.images.countField })
  @IsUrl({}, { each: true, message: OfferValidationMessages.images.invalidFormat })
  public images!: string[];

  @IsDefined({ message: OfferValidationMessages.isPremium.requiredField })
  @IsBoolean({ message: OfferValidationMessages.isPremium.invalidFormat })
  public isPremium!: boolean;

  @IsDefined({ message: OfferValidationMessages.type.requiredField })
  @IsEnum(OfferType, { message: OfferValidationMessages.type.invalidFormat })
  public type!: OfferType;

  @IsDefined({ message: OfferValidationMessages.roomsCount.requiredField })
  @IsInt({ message: OfferValidationMessages.roomsCount.invalidFormat })
  @Min(OfferRoom.MIN, { message: OfferValidationMessages.roomsCount.rangeField })
  @Max(OfferRoom.MAX, { message: OfferValidationMessages.roomsCount.rangeField })
  public roomsCount!: number;

  @IsDefined({ message: OfferValidationMessages.guestsCount.requiredField })
  @IsInt({ message: OfferValidationMessages.guestsCount.invalidFormat })
  @Min(OfferGuest.MIN, { message: OfferValidationMessages.guestsCount.rangeField })
  @Max(OfferGuest.MAX, { message: OfferValidationMessages.guestsCount.rangeField })
  public guestsCount!: number;

  @IsDefined({ message: OfferValidationMessages.price.requiredField })
  @IsInt({ message: OfferValidationMessages.price.invalidFormat })
  @Min(OfferPrice.MIN, { message: OfferValidationMessages.price.rangeField })
  @Max(OfferPrice.MAX, { message: OfferValidationMessages.price.rangeField })
  public price!: number;

  @IsDefined({ message: OfferValidationMessages.conveniences.requiredField })
  @IsArray({ message: OfferValidationMessages.conveniences.invalidFormat })
  @ArrayMinSize(MIN_CONVENIENCES_COUNT, { message: OfferValidationMessages.conveniences.invalidFormat })
  @IsEnum(Convenience, { each: true, message: OfferValidationMessages.conveniences.invalidFormatElement })
  public conveniences!: Convenience[];

  @IsDefined({ message: OfferValidationMessages.coordinates.requiredField })
  @ValidateNested({ message: OfferValidationMessages.coordinates.invalidFormat })
  @Type(() => CoordinatesDto)
  public coordinates!: Coordinates;
}

export class CreateOfferServiceDto extends CreateOfferDto {
  @IsDefined({ message: OfferValidationMessages.isFavorite.requiredField })
  @IsBoolean({ message: OfferValidationMessages.isFavorite.invalidFormat })
  public isFavorite!: boolean;

  @IsDefined({ message: OfferValidationMessages.rating.requiredField })
  @IsInt({ message: OfferValidationMessages.rating.invalidFormat })
  @Min(OfferRating.MIN, { message: OfferValidationMessages.rating.rangeField })
  @Max(OfferRating.MAX, { message: OfferValidationMessages.rating.rangeField })
  public rating!: number;

  @IsDefined({ message: OfferValidationMessages.authorId.requiredField })
  @IsMongoId({ message: OfferValidationMessages.authorId.invalidFormat })
  public authorId!: string;

  @IsDefined({ message: OfferValidationMessages.commentsCount.requiredField })
  @IsInt({ message: OfferValidationMessages.commentsCount.invalidFormat })
  @Min(MIN_COMMENTS_COUNT, { message: OfferValidationMessages.commentsCount.rangeField })
  public commentsCount!: number;
}
