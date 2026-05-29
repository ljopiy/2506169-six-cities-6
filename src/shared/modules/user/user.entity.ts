import { defaultClasses, getModelForClass, prop, modelOptions, Ref } from '@typegoose/typegoose';
import { User, UserType } from '../../types/index.js';
import { createSHA256 } from '../../helpers/index.js';
import type { OfferEntity } from '../offer/offer.entity.js';
import { UserEntityConfig, UserName, UserPassword } from './user.constant.js';
import { OfferEntityConfig } from '../offer/offer.constant.js';

export interface UserEntity extends defaultClasses.Base { }

@modelOptions({
  schemaOptions: {
    collection: UserEntityConfig.COLLECTION,
    timestamps: true
  }
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({
    required: true,
    type: () => String,
    trim: true,
    minlength: UserName.MIN_LENGTH,
    maxlength: UserName.MAX_LENGTH
  })
  public name!: string;

  @prop({
    required: true,
    type: () => String,
    unique: true,
    trim: true
  })
  public email!: string;

  @prop({type: () => String})
  public avatarPath?: string;

  @prop({
    required: true,
    type: () => String,
    enum: UserType,
    default: UserType.Ordinary
  })
  public type!: UserType;

  @prop({
    required: true,
    type: () => String,
    minlength: UserPassword.HASH_LENGTH,
    maxlength: UserPassword.HASH_LENGTH
  })
  private password?: string;

  @prop({
    type: () => [String],
    ref: OfferEntityConfig.REF,
    default: [],
  })
  public favoriteOffers!: Ref<OfferEntity>[];

  constructor(userData: User) {
    super();

    this.name = userData.name;
    this.email = userData.email;
    this.avatarPath = userData.avatarPath;
    this.type = userData.type;
  }

  public setPassword(password: string, salt: string): void {
    this.password = createSHA256(password, salt);
  }

  public getPassword(): string | undefined {
    return this.password;
  }

  public verifyPassword(password: string, salt: string): boolean {
    const hashPassword = createSHA256(password, salt);
    return hashPassword === this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
