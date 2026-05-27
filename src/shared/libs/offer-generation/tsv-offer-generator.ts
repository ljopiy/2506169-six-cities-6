import dayjs from 'dayjs';
import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerData, Convenience, OfferType, UserType, CityName } from '../../types/index.js';
import { generateRandomValue, getRandomItem, getRandomItems } from '../../helpers/index.js';
import generator from 'generate-password';

const MIN_PRICE = 100;
const MAX_PRICE = 100000;

const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerData) { }

  public generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const postDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();
    const city = getRandomItem<CityName>(this.mockData.cities);
    const previewUrl = getRandomItem<string>(this.mockData.images);
    const images = this.mockData.images.join(',');
    const isPremium = generateRandomValue(0, 1) === 1;
    const rating = generateRandomValue(1, 5, 1);
    const type = getRandomItem<OfferType>(Object.values(OfferType));
    const roomsCount = generateRandomValue(1, 8);
    const guestsCount = generateRandomValue(1, 10);
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE);
    const conveniences = getRandomItems(Object.keys(Convenience)).join(',');
    const authorName = getRandomItem<string>(this.mockData.authors);
    const authorEmail = getRandomItem<string>(this.mockData.emails);
    const authorAvatarPath = this.mockData.avatar;
    const authorPassword = generator.generate({ length: 10, numbers: true });
    const authorType = getRandomItem<UserType>(Object.values(UserType));
    const commentsCount = 0;
    const coordinates = `${generateRandomValue(-90, 90, 6)},${generateRandomValue(-180, 180, 6)}`;

    return [
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
      coordinates
    ].join('\t');
  }
}
