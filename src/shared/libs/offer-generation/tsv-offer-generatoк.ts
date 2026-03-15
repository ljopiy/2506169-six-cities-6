import dayjs from 'dayjs';
import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerData, Convenience, OfferType, UserType, City } from '../../types/index.js';
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
    const cityObj = getRandomItem<City>(this.mockData.cities);
    const city = cityObj.name;
    const cityLatitude = cityObj.latitude;
    const cityLongitude = cityObj.longitude;
    const previewPath = getRandomItem<string>(this.mockData.images);
    const images = this.mockData.images.join(',');
    const isPremium = generateRandomValue(0, 1) === 1;
    const isFavorite = generateRandomValue(0, 1) === 1;
    const rating = generateRandomValue(1, 5, 1);
    const type = getRandomItem<string>(Object.keys(OfferType));
    const roomsCount = generateRandomValue(1, 8);
    const guestsCount = generateRandomValue(1, 10);
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE);
    const conveniences = getRandomItems<string>(Object.keys(Convenience)).join(',');
    const authorName = getRandomItem<string>(this.mockData.authors);
    const authorEmail = getRandomItem<string>(this.mockData.emails);
    const authorAvatarPath = getRandomItem<string>(this.mockData.avatars);
    const authorPassword = generator.generate({ length: 10, numbers: true });
    const authorType = getRandomItem<string>(Object.keys(UserType));
    const commentsCount = generateRandomValue(0, 100);
    const latitude = generateRandomValue(cityLatitude - 0.5, cityLatitude + 0.5, 6);
    const longitude = generateRandomValue(cityLongitude - 0.5, cityLongitude + 0.5, 6);

    return [
      title,
      description,
      postDate,
      city,
      cityLatitude,
      cityLongitude,
      previewPath,
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
      latitude,
      longitude,
    ].join('\t');
  }
}
