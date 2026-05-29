export const MAX_COMMENT_COUNT = 50;

export const CommentText = {
  DEFAULT: '',
  MIN_LENGTH: 5,
  MAX_LENGTH: 1024
} as const;

export const CommentRating = {
  DEFAULT: 0,
  MIN: 1,
  MAX: 5
} as const;

export const CommentEntityConfig = {
  COLLECTION: 'comments',
  REF: 'CommentEntity'
} as const;
