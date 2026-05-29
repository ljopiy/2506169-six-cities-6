import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { CityName, Convenience, OfferType } from '../../types/index.js';
import type { UserEntity } from '../user/user.entity.js';
import { CoordinatesSchema } from './coordinates.schema.js';
import {
  IS_PREMIUM,
  IS_FAVORITE,
  MIN_COMMENTS_COUNT,
  OfferDescription,
  OfferEntityConfig,
  OfferGuest,
  OfferPrice,
  OfferRating,
  OfferRoom,
  OfferTitle
} from './offer.constant.js';
import { UserEntityConfig } from '../user/user.constant.js';

export interface OfferEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: OfferEntityConfig.COLLECTION,
    timestamps: true
  }
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    type: () => String,
    trim: true,
    minlength: OfferTitle.MIN_LENGTH,
    maxlength: OfferTitle.MAX_LENGTH
  })
  public title!: string;

  @prop({
    required: true,
    type: () => String,
    trim: true,
    minlength: OfferDescription.MIN_LENGTH,
    maxlength: OfferDescription.MAX_LENGTH
  })
  public description!: string;

  @prop({
    required: true,
    type: () => Date,
    default: () => new Date()
  })
  public postDate!: Date;

  @prop({
    required: true,
    enum: CityName,
    type: () => String
  })
  public city!: CityName;

  @prop({
    required: true,
    type: () => String,
    trim: true
  })
  public previewUrl!: string;

  @prop({
    required: true,
    type: () => [String]
  })
  public images!: string[];

  @prop({
    required: true,
    type: () => Boolean,
    default: IS_PREMIUM
  })
  public isPremium!: boolean;

  @prop({
    type: () => Boolean,
    default: IS_FAVORITE
  })
  public isFavorite?: boolean;

  @prop({
    required: true,
    type: () => Number,
    min: OfferRating.MIN,
    max: OfferRating.MAX,
    default: OfferRating.DEFAULT
  })
  public rating!: number;

  @prop({
    required: true,
    type: () => String,
    enum: OfferType
  })
  public type!: OfferType;

  @prop({
    required: true,
    type: () => Number,
    min: OfferRoom.MIN,
    max: OfferRoom.MAX
  })
  public roomsCount!: number;

  @prop({
    required: true,
    type: () => Number,
    min: OfferGuest.MIN,
    max: OfferGuest.MAX
  })
  public guestsCount!: number;

  @prop({
    required: true,
    type: () => Number,
    min: OfferPrice.MIN,
    max: OfferPrice.MAX
  })
  public price!: number;

  @prop({
    required: true,
    type: () => [String],
    enum: Convenience
  })
  public conveniences!: Convenience[];

  @prop({
    type: () => String,
    required: true,
    ref: UserEntityConfig.REF
  })
  public authorId!: Ref<UserEntity>;

  @prop({
    type: () => Number,
    default: MIN_COMMENTS_COUNT
  })
  public commentsCount!: number;

  @prop({
    required: true,
    _id: false,
    type: () => CoordinatesSchema
  })
  public coordinates!: CoordinatesSchema;
}

export const OfferModel = getModelForClass(OfferEntity);
