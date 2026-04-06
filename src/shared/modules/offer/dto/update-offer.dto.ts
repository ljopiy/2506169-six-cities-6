import { Convenience, OfferType, Coordinates } from '../../../types/index.js';

export class UpdateOfferDto {
  public title?: string;
  public description?: string;
  public city?: string;
  public previewPath?: string;
  public images?: string[];
  public isPremium?: boolean;
  public isFavorite?: boolean;
  public rating?: number;
  public type?: OfferType;
  public roomsCount?: number;
  public guestsCount?: number;
  public price?: number;
  public conveniences?: Convenience[];
  public commentsCount?: number;
  public coordinates?: Coordinates;
}
