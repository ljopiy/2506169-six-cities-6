export const AVATAR_DEFAULT_PATH = '/static/default-avatar.png';

export const UserName = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 15
} as const;

export const UserPassword = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 12,
  HASH_LENGTH: 64
} as const;

export const UserEntityConfig = {
  COLLECTION: 'users',
  REF: 'UserEntity'
} as const;
