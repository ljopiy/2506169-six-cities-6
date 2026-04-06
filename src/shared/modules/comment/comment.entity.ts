import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';
import { OfferEntity } from '../offer/offer.entity.js';

export interface CommentEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: 'comments',
    timestamps: true,
  }
})
export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    default: '',
    trim: true,
    minlength: 5,
    maxlength: 1024
  })
  public text!: string;

  @prop({
    required: true,
    default: 0,
    min: 1,
    max: 5
  })
  public rating!: number;

  @prop({
    ref: UserEntity,
    required: true
  })
  public authorId!: Ref<UserEntity>;

  @prop({
    ref: OfferEntity,
    required: true
  })
  public offerId!: Ref<OfferEntity>;
}

export const CommentModel = getModelForClass(CommentEntity);
