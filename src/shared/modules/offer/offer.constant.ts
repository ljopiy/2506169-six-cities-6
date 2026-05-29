export const DEFAULT_OFFER_COUNT = 60;
export const MAX_PREMIUM_OFFER_COUNT = 3;
export const IS_PREMIUM = false;
export const IS_FAVORITE = false;
export const MIN_COMMENTS_COUNT = 0;
export const MIN_CONVENIENCES_COUNT = 1;

export const OfferTitle = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 100
} as const;

export const OfferDescription = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 1024
} as const;

export const OfferImage = {
  MIN_COUNT: 6,
  MAX_COUNT: 6
} as const;

export const OfferRoom = {
  MIN: 1,
  MAX: 8
} as const;

export const OfferGuest = {
  MIN: 1,
  MAX: 10
} as const;

export const OfferPrice = {
  MIN: 100,
  MAX: 100000
} as const;

export const OfferRating = {
  DEFAULT: 0,
  MIN: 0,
  MAX: 5
} as const;

export const OfferCoordinates = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180
} as const;

export const OfferEntityConfig = {
  COLLECTION: 'offers',
  REF: 'OfferEntity'
} as const;
