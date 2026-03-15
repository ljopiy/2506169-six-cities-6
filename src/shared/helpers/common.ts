import { Convenience, Offer, OfferType, UserType } from '../types/index.js';
import { inject, injectable } from 'inversify';
import { Logger } from '../libs/logger/index.js';
import { Config, RestSchema } from '../libs/config/index.js';
import { Component } from '../types/index.js';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';


export function generateRandomValue(min:number, max: number, numAfterDigit = 0) {
  return +((Math.random() * (max - min)) + min).toFixed(numAfterDigit);
}


export function getCurrentModuleDirectoryPath(): string {
  const filepath = fileURLToPath(import.meta.url);
  return dirname(filepath);
}

export function getRandomItems<T>(items: T[]):T[] {
  const startPosition = generateRandomValue(0, items.length - 1);
  const endPosition = startPosition + generateRandomValue(startPosition, items.length);
  return items.slice(startPosition, endPosition);
}

export function getRandomItem<T>(items: T[]):T {
  return items[generateRandomValue(0, items.length - 1)];
}

@injectable()
export class RestApplication {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) { }

  public async init(): Promise<void> {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);
    this.logger.info(`Get value from env $SALT: ${this.config.get('SALT')}`);
    this.logger.info(`Get value from env $DB_HOST: ${this.config.get('DB_HOST')}`);
  }
}

export function createOffer(offerData: string): Offer {
  const [
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
  ] = offerData.replace('\n', '').split('\t');

  const author = {
    name: authorName,
    email: authorEmail,
    avatar: authorAvatarPath,
    password: authorPassword,
    type: UserType[authorType as keyof typeof UserType]
  };

  const offerCity = {
    name: city,
    latitude: Number.parseFloat(cityLatitude),
    longitude: Number.parseFloat(cityLongitude)
  };

  return {
    title,
    description,
    postDate: new Date(postDate),
    city: offerCity,
    previewPath,
    images: images.split(','),
    isPremium: isPremium === 'true',
    isFavorite: isFavorite === 'true',
    rating: Number.parseFloat(rating),
    type: OfferType[type as keyof typeof OfferType],
    roomsCount: Number.parseInt(roomsCount, 10),
    guestsCount: Number.parseInt(guestsCount, 10),
    price: Number.parseInt(price, 10),
    conveniences: conveniences.split(',').map((convenience) => Convenience[convenience as keyof typeof Convenience]),
    author,
    commentsCount: Number.parseInt(commentsCount, 10),
    latitude: Number.parseFloat(latitude),
    longitude: Number.parseFloat(longitude)
  };
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}
