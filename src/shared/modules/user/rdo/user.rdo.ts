import { Expose, Transform } from 'class-transformer';
import { AVATAR_DEFAULT_PATH } from '../user.constant.js';

export class UserRdo {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  @Transform(({ value }) => value ?? AVATAR_DEFAULT_PATH, { toClassOnly: true })
  public avatarPath!: string;

  @Expose()
  public type!: string;
}
