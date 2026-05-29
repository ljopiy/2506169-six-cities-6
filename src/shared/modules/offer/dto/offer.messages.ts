export const OfferValidationMessages = {
  title: {
    requiredField: 'title is required',
    invalidFormat: 'title must be string',
    lengthField: 'title: min length is 10, max is 100'
  },
  description: {
    requiredField: 'description is required',
    invalidFormat: 'description must be string',
    lengthField: 'description: min length is 20, max is 1024'
  },
  postDate: {
    requiredField: 'postDate is required',
    invalidFormat: 'postDate must be a valid ISO date'
  },
  city: {
    requiredField: 'city is required',
    invalidFormat: 'city must be one of six cities: Paris, Cologne, Brussels, Amsterdam, Hamburg, Dusseldorf'
  },
  previewUrl: {
    requiredField: 'previewUrl is required',
    invalidFormat: 'previewUrl must be valid URL',
  },
  images: {
    requiredField: 'images is required',
    invalidFormat: 'images must be an array of 6 valid URLs',
    countField: 'images count must be exactly 6'
  },
  isPremium: {
    requiredField: 'isPremium is required',
    invalidFormat: 'isPremium must be boolean'
  },
  isFavorite: {
    requiredField: 'isFavorite is required',
    invalidFormat: 'isFavorite must be boolean'
  },
  rating: {
    requiredField: 'rating is required',
    invalidFormat: 'rating must be a number',
    rangeField: 'rating must be between 0 and 5'
  },
  type: {
    requiredField: 'type is required',
    invalidFormat: 'type must be apartment, house, room or hotel'
  },
  roomsCount: {
    requiredField: 'roomsCount is required',
    invalidFormat: 'roomsCount must be an integer',
    rangeField: 'min roomsCount is 1, max is 8'
  },
  guestsCount: {
    requiredField: 'guestsCount is required',
    invalidFormat: 'guestsCount must be an integer',
    rangeField: 'min guestsCount is 1, max is 10'
  },
  price: {
    requiredField: 'price is required',
    invalidFormat: 'price must be an integer',
    rangeField: 'min price is 100, max is 100000'
  },
  conveniences: {
    requiredField: 'conveniences is required',
    invalidFormat: 'conveniences must be a non-empty array',
    invalidFormatElement: 'conveniences can only contain: Breakfast, Air conditioning, Laptop friendly workspace, Baby seat, Washer, Towels, Fridge',
  },
  coordinates: {
    requiredField: 'coordinates is required',
    invalidFormat: 'coordinates object is required'
  },
  authorId: {
    requiredField: 'authorId is required',
    invalidFormat: 'authorId must be a valid MongoID'
  },
  commentsCount: {
    requiredField: 'commentsCount is required',
    invalidFormat: 'commentsCount must be an integer',
    rangeField: 'commentsCount must be greater than or equal to 0'
  },
  latitude: {
    requiredField: 'latitude is required',
    invalidFormat: 'latitude must be a number',
    rangeField: 'latitude must be between -90 and 90'
  },
  longitude: {
    requiredField: 'longitude is required',
    invalidFormat: 'longitude must be a number',
    rangeField: 'longitude must be between -180 and 180'
  }
} as const;
