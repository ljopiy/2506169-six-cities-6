import dayjs from 'dayjs';
import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerData, Convenience, OfferType, UserType, CityName } from '../../types/index.js';
import { generateRandomValue, getRandomItem, getRandomItems } from '../../helpers/index.js';
import generator from 'generate-password';

const AUTHOR_PASSWORD_LENGTH = 10;
const COMMENTS_COUNT = 0;
const IS_FAVORITE = false;
const DATE_UNIT = 'day';

const Price = {
  MIN: 100,
  MAX: 100000
} as const;

const WeekDay = {
  FIRST: 1,
  LAST: 7
} as const;

const Binary = {
  MIN: 0,
  MAX: 1
} as const;

const Rating = {
  MIN: 1,
  MAX: 5,
  FRACTION_DIGITS: 1
} as const;

const Room = {
  MIN: 1,
  MAX: 8
} as const;

const Guest = {
  MIN: 1,
  MAX: 10
} as const;

const Coordinates = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
  FRACTION_DIGITS: 6
} as const;

const Delimiter = {
  VALUE: ',',
  ROW: '\t'
} as const;

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerData) { }

  public generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const postDate = dayjs()
      .subtract(generateRandomValue(WeekDay.FIRST, WeekDay.LAST), DATE_UNIT)
      .toISOString();
    const city = getRandomItem<CityName>(this.mockData.cities);
    const previewUrl = getRandomItem<string>(this.mockData.images);
    const images = this.mockData.images.join(Delimiter.VALUE);
    const isPremium = generateRandomValue(Binary.MIN, Binary.MAX) === 1;
    const isFavorite = IS_FAVORITE;
    const rating = generateRandomValue(Rating.MIN, Rating.MAX, Rating.FRACTION_DIGITS);
    const type = getRandomItem<OfferType>(Object.values(OfferType));
    const roomsCount = generateRandomValue(Room.MIN, Room.MAX);
    const guestsCount = generateRandomValue(Guest.MIN, Guest.MAX);
    const price = generateRandomValue(Price.MIN, Price.MAX);
    const conveniences = getRandomItems(Object.values(Convenience)).join(Delimiter.VALUE);
    const authorName = getRandomItem<string>(this.mockData.authors);
    const authorEmail = getRandomItem<string>(this.mockData.emails);
    const authorAvatarPath = this.mockData.avatar;
    const authorPassword = generator.generate({ length: AUTHOR_PASSWORD_LENGTH, numbers: true });
    const authorType = getRandomItem<UserType>(Object.values(UserType));
    const commentsCount = COMMENTS_COUNT;
    const coordinates = `${generateRandomValue(Coordinates.LATITUDE_MIN, Coordinates.LATITUDE_MAX, Coordinates.FRACTION_DIGITS)}${Delimiter.VALUE}${generateRandomValue(Coordinates.LONGITUDE_MIN, Coordinates.LONGITUDE_MAX, Coordinates.FRACTION_DIGITS)}`;

    return [
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
      coordinates
    ].join(Delimiter.ROW);
  }
}
