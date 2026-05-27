export const OfferValidationMessages = {
  title: {
    invalidFormat: 'title is required',
    lengthField: 'title: min length is 10, max is 100'
  },
  description: {
    invalidFormat: 'description is required',
    lengthField: 'description: min length is 20, max is 1024'
  },
  postDate: {
    invalidFormat: 'postDate must be a valid ISO date'
  },
  city: {
    invalidFormat: 'city must be one of six cities: Paris, Cologne, Brussels, Amsterdam, Hamburg, Dusseldorf'
  },
  previewUrl: {
    invalidFormat: 'previewUrl must be valid URL',
  },
  images: {
    invalidFormat: 'images must be an array of 6 URLs',
    countField: 'images count must be exactly 6'
  },
  isPremium: {
    invalidFormat: 'isPremium must be boolean'
  },
  type: {
    invalidFormat: 'type must be apartment, house, room or hotel'
  },
  roomsCount: {
    invalidFormat: 'roomsCount must be an integer',
    rangeField: 'min roomsCount is 1, max is 8'
  },
  guestsCount: {
    invalidFormat: 'guestsCount must be an integer',
    rangeField: 'min guestsCount is 1, max is 10'
  },
  price: {
    invalidFormat: 'price must be an integer',
    rangeField: 'min price is 100, max is 100000'
  },
  conveniences: {
    invalidFormat: 'conveniences must be a non-empty array'
  },
  coordinates: {
    invalidFormat: 'coordinates object is required'
  },
  latitude: {
    invalidFormat: 'latitude must be a number',
    rangeField: 'latitude must be between -90 and 90'
  },
  longitude: {
    invalidFormat: 'longitude must be a number',
    rangeField: 'longitude must be between -180 and 180'
  }
} as const;
