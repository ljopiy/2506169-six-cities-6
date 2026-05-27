import { Expose, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';
import { CityRdo } from './offer-city.rdo.js';

export class OfferRdo {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public roomsCount!: number;

  @Expose()
  public guestsCount!: number;

  @Expose()
  public price!: number;

  @Expose()
  public conveniences!: string[];

  @Expose()
  public previewUrl!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public commentsCount!: number;

  @Expose({ name: 'authorId' })
  @Type(() => UserRdo)
  public author!: UserRdo;

  @Expose()
  @Type(() => CityRdo)
  public city!: CityRdo;

  @Expose()
  public coordinates!: {
    latitude: number;
    longitude: number;
  };
}
