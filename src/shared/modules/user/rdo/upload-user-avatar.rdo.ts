import { Expose } from 'class-transformer';

export class UploadUserAvatarRdo {
  @Expose()
  public avatarPath: string;
}
