import { User } from './user.type.js';
import { OfferType } from './offer-type.enum.js';
import { Convenience } from './convenience.enum.js';
import { Coordinates } from './coordinates.type.js';
import { CityName } from './city-name.enum.js';

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  city: CityName;
  previewUrl: string;
  images: string[];
  isPremium: boolean;
  rating: number;
  type: OfferType;
  roomsCount: number;
  guestsCount: number;
  price: number;
  conveniences: Convenience[];
  author: User;
  commentsCount: number;
  coordinates: Coordinates;
}
