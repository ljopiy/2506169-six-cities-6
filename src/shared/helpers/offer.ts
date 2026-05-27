import { DocumentType } from '@typegoose/typegoose';
import { Convenience, Offer, OfferType, UserType, CityName } from '../types/index.js';
import { Cities } from '../constants/cities.js';
import { OfferEntity } from '../modules/offer/offer.entity.js';

export function createOffer(offerData: string): Offer {
  const [
    title,
    description,
    postDate,
    city,
    previewUrl,
    images,
    isPremium,
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
  ] = offerData.replace('\n', '').split('\t');

  const author = {
    name: authorName,
    email: authorEmail,
    avatarPath: authorAvatarPath,
    password: authorPassword,
    type: parseUserType(authorType)
  };

  const offerCoordinates = {
    latitude: Number.parseFloat(coordinates.split(',')[0]),
    longitude: Number.parseFloat(coordinates.split(',')[1])
  };
  const normalizedOfferType = parseOfferType(type);

  return {
    title,
    description,
    postDate: new Date(postDate),
    city: parseCityName(city),
    previewUrl,
    images: images.split(','),
    isPremium: isPremium === 'true',
    rating: Number.parseFloat(rating),
    type: normalizedOfferType,
    roomsCount: Number.parseInt(roomsCount, 10),
    guestsCount: Number.parseInt(guestsCount, 10),
    price: Number.parseInt(price, 10),
    conveniences: conveniences.split(',').map((convenience) => parseConvenience(convenience)),
    author,
    commentsCount: Number.parseInt(commentsCount, 10),
    coordinates: offerCoordinates
  };
}

export function prepareOffer(offer: DocumentType<OfferEntity>) {
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

function parseUserType(value: string): UserType {
  return parseEnumValue(
    value,
    Object.values(UserType) as UserType[],
    {},
    'user type'
  );
}

function parseOfferType(value: string): OfferType {
  return parseEnumValue(
    value,
    Object.values(OfferType) as OfferType[],
    {
      Apartment: OfferType.Apartment,
      House: OfferType.House,
      Room: OfferType.Room,
      Hotel: OfferType.Hotel
    },
    'offer type'
  );
}

function parseCityName(value: string): CityName {
  return parseEnumValue(
    value,
    Object.values(CityName) as CityName[],
    {},
    'city'
  );
}

function parseConvenience(value: string): Convenience {
  return parseEnumValue(
    value,
    Object.values(Convenience) as Convenience[],
    {
      Breakfast: Convenience.Breakfast,
      AirConditioning: Convenience.AirConditioning,
      LaptopFriendlyWorkspace: Convenience.LaptopFriendlyWorkspace,
      BabySeat: Convenience.BabySeat,
      Washer: Convenience.Washer,
      Towels: Convenience.Towels,
      Fridge: Convenience.Fridge
    },
    'convenience'
  );
}

function parseEnumValue<T extends string>(
  value: string,
  values: readonly T[],
  legacyMap: Partial<Record<string, T>>,
  label: string
): T {
  if (values.includes(value as T)) {
    return value as T;
  }

  const mapped = legacyMap[value];
  if (mapped) {
    return mapped;
  }

  throw new Error(`Invalid ${label}: ${value}`);
}
