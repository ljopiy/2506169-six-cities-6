import { Convenience, OfferType, Coordinates } from '../../../types/index.js';

export class CreateOfferDto {
  public title!: string;
  public description!: string;
  public postDate!: Date;
  public city!: string;
  public previewPath!: string;
  public images!: string[];
  public isPremium!: boolean;
  public isFavorite!: boolean;
  public rating!: number;
  public type!: OfferType;
  public roomsCount!: number;
  public guestsCount!: number;
  public price!: number;
  public conveniences!: Convenience[];
  public authorId!: string;
  public commentsCount!: number;
  public coordinates!: Coordinates;
}
