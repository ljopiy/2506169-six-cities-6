import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../modules/user/user.entity.js';
import { STATIC_FILES_ROUTE } from '../../rest/rest.constant.js';

const DEFAULT_AVATAR_PATH = `${STATIC_FILES_ROUTE}/default-avatar.png`;

export function prepareUser(user: DocumentType<UserEntity>) {
  const plain = user.toObject();

  return {
    ...plain,
    id: String(user._id),
    avatarPath: plain.avatarPath ?? DEFAULT_AVATAR_PATH,
  };
}
