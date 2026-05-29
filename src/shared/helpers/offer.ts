import { DocumentType } from '@typegoose/typegoose';
import { Convenience, Offer, OfferType, UserType, CityName } from '../types/index.js';
import { Cities } from '../modules/offer/cities.constant.js';
import { OfferEntity } from '../modules/offer/offer.entity.js';

const USER_TYPE_LABEL = 'user type';
const OFFER_TYPE_LABEL = 'offer type';
const CITY_LABEL = 'city';
const CONVENIENCE_LABEL = 'convenience';

export function createOffer(offerData: string): Offer {
  const [
    title,
    description,
    postDate,
    city,
    previewUrl,
    images,
    isPremium,
    isFavorite,
    rating,
    type,
    roomsCount,
    guestsCount,
    price,
    conveniences,
    authorName,
    authorEmail,
    authorAvatarPath,
    authorPassword,
    authorType,
    commentsCount,
    coordinates,
  ] = offerData.trim().split('\t');

  const [latitude, longitude] = coordinates.split(',').map((coordinate) => Number.parseFloat(coordinate));

  const offerCoordinates = {
    latitude,
    longitude
  };

  const author = {
    name: authorName,
    email: authorEmail,
    avatarPath: authorAvatarPath,
    password: authorPassword,
    type: parseEnumValue(
      authorType,
      Object.values(UserType) as UserType[],
      USER_TYPE_LABEL
    )
  };

  const normalizedCity = parseEnumValue(
    city,
    Object.values(CityName) as CityName[],
    CITY_LABEL
  );

  const normalizedOfferType = parseEnumValue(
    type,
    Object.values(OfferType) as OfferType[],
    OFFER_TYPE_LABEL
  );

  const normalizedConveniences = conveniences
    .split(',')
    .map((convenience) => parseEnumValue(
      convenience.trim(),
      Object.values(Convenience) as Convenience[],
      CONVENIENCE_LABEL
    ));

  return {
    title,
    description,
    postDate: new Date(postDate),
    city: normalizedCity,
    previewUrl,
    images: images.split(','),
    isPremium: isPremium === 'true',
    isFavorite: isFavorite === 'true',
    rating: Number.parseFloat(rating),
    type: normalizedOfferType,
    roomsCount: Number.parseInt(roomsCount, 10),
    guestsCount: Number.parseInt(guestsCount, 10),
    price: Number.parseInt(price, 10),
    conveniences: normalizedConveniences,
    author,
    commentsCount: Number.parseInt(commentsCount, 10),
    coordinates: offerCoordinates
  };
}

export function prepareOffer(offer: DocumentType<OfferEntity>): Record<string, unknown> & {
  id: string;
  city: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
} {
  const plain = offer.toObject();
  const city = Cities[plain.city];

  return {
    ...plain,
    id: String(offer._id),
    city: {
      name: city.name,
      coordinates: {
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },
  };
}

function parseEnumValue<T extends string>(
  value: string,
  values: readonly T[],
  label: string
): T {
  if (values.includes(value as T)) {
    return value as T;
  }

  throw new Error(`Invalid ${label}: ${value}`);
}
