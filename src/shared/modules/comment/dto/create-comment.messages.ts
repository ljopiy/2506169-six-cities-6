export const CreateCommentMessages = {
  text: {
    requiredField: 'text is required',
    invalidFormat: 'text must be string',
    lengthField: 'min length is 5, max is 1024'
  },
  rating: {
    requiredField: 'rating is required',
    invalidFormat: 'rating must be number',
    rangeField: 'min rating is 1, max is 5'
  },
  offerId: {
    requiredField: 'offerId is required',
    invalidFormat: 'offerId must be a valid MongoID'
  },
  authorId: {
    requiredField: 'authorId is required',
    invalidFormat: 'authorId must be a valid MongoID'
  }
} as const;
