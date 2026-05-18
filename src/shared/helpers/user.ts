import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../modules/user/user.entity.js';

const DEFAULT_AVATAR_PATH = '/upload/default-avatar.png';

export function prepareUser(user: DocumentType<UserEntity>) {
  const plain = user.toObject() as UserEntity;

  return {
    ...plain,
    id: String(user._id),
    avatarPath: plain.avatarPath ?? DEFAULT_AVATAR_PATH,
  };
}
