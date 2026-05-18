export const CreateCommentMessages = {
  text: {
    invalidFormat: 'text is required',
    lengthField: 'min length is 5, max is 1024'
  },
  rating: {
    invalidFormat: 'rating is required',
    rangeField: 'min rating is 1, max is 5'
  }
} as const;
