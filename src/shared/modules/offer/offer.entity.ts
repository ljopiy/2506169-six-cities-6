import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { CityName, Convenience, OfferType } from '../../types/index.js';
import { UserEntity } from '../user/user.entity.js';
import { CoordinatesSchema } from './coordinates.schema.js';

export interface OfferEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: 'offers',
    timestamps: true
  }
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 100
  })
  public title!: string;

  @prop({
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 1024
  })
  public description!: string;

  @prop({
    required: true,
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
    trim: true
  })
  public previewPath!: string;

  @prop({
    required: true,
    type: () => [String]
  })
  public images!: string[];

  @prop({
    required: true,
    default: false
  })
  public isPremium!: boolean;

  @prop({
    required: true,
    default: false
  })
  public isFavorite!: boolean;

  @prop({
    required: true,
    min: 1,
    max: 5
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
    min: 1,
    max: 8
  })
  public roomsCount!: number;

  @prop({
    required: true,
    min: 1,
    max: 10
  })
  public guestsCount!: number;

  @prop({
    required: true,
    min: 100,
    max: 100000
  })
  public price!: number;

  @prop({
    required: true,
    type: () => [String],
    enum: Convenience
  })
  public conveniences!: Convenience[];

  @prop({
    required: true,
    ref: UserEntity
  })
  public authorId!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount!: number;

  @prop({
    required: true,
    _id: false,
    type: () => CoordinatesSchema
  })
  public coordinates!: CoordinatesSchema;
}

export const OfferModel = getModelForClass(OfferEntity);
