import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import type { UserEntity } from '../user/user.entity.js';
import type { OfferEntity } from '../offer/offer.entity.js';
import { CommentEntityConfig, CommentRating, CommentText } from './comment.constant.js';
import { UserEntityConfig } from '../user/user.constant.js';
import { OfferEntityConfig } from '../offer/offer.constant.js';

export interface CommentEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: CommentEntityConfig.COLLECTION,
    timestamps: true,
  }
})
export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    type: () => String,
    default: CommentText.DEFAULT,
    trim: true,
    minlength: CommentText.MIN_LENGTH,
    maxlength: CommentText.MAX_LENGTH
  })
  public text!: string;

  @prop({
    required: true,
    type: () => Number,
    default: CommentRating.DEFAULT,
    min: CommentRating.MIN,
    max: CommentRating.MAX
  })
  public rating!: number;

  @prop({
    type: () => String,
    ref: UserEntityConfig.REF,
    required: true
  })
  public authorId!: Ref<UserEntity>;

  @prop({
    type: () => String,
    ref: OfferEntityConfig.REF,
    required: true
  })
  public offerId!: Ref<OfferEntity>;
}

export const CommentModel = getModelForClass(CommentEntity);
