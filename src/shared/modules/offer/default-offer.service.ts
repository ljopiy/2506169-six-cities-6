import { inject, injectable } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component, SortType } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { DeleteResult } from 'mongoose';
import { UserEntity } from '../user/user.entity.js';
import { CommentEntity } from '../comment/comment.entity.js';
import { CreateOfferServiceDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { extractRefId } from '../../helpers/index.js';
import { DEFAULT_OFFER_COUNT, DEFAULT_PREMIUM_OFFER_COUNT } from './offer.constant.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) { }

  public async create(dto: CreateOfferServiceDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return result.populate('authorId');
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate('authorId').exec();
  }

  public async find(limit = DEFAULT_OFFER_COUNT): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel.find({}).populate('authorId').sort({ postDate: SortType.Down }).limit(limit).exec();
  }

  public async deleteById(offerId: string): Promise<DeleteResult> {
    return this.offerModel.deleteOne({ _id: offerId }).exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findOneAndUpdate({ _id: offerId }, dto, { new: true }).populate('authorId');
  }

  public async findPremiumByCity(city: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel.find({ 'city': city, isPremium: true }).populate('authorId').sort({ postDate: SortType.Down }).limit(DEFAULT_PREMIUM_OFFER_COUNT).exec();
  }

  public async incCommentCount(offerId: string): Promise<void> {
    await this.offerModel.updateOne({ _id: offerId }, { $inc: { commentsCount: 1 } }).exec();
  }

  public async recalculateRating(offerId: string): Promise<void> {
    const avgRatingResult = await this.commentModel
      .aggregate([
        {
          $match: {
            offerId: offerId
          }
        },
        {
          $group: {
            _id: '$offerId',
            avgRating: { $avg: '$rating' }
          }
        },
      ])
      .exec();
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
    const roundedAvgRating = Math.round(avgRating * 10) / 10;
    await this.offerModel.findByIdAndUpdate(offerId, { rating: roundedAvgRating });
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: documentId })) !== null;
  }

  public async findFavorite(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const user = await this.userModel.findById(userId).select('favoriteOffers').exec();
    const favoriteOffers = user?.favoriteOffers ?? [];
    const favoriteOfferIds = favoriteOffers.map((favoriteOffer) => extractRefId(favoriteOffer));

    if (favoriteOfferIds.length === 0) {
      return [];
    }

    return this.offerModel
      .find({ _id: { $in: favoriteOfferIds } })
      .populate('authorId')
      .sort({ postDate: SortType.Down })
      .exec();
  }

  public async addToFavorite(offerId: string, userId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } }).exec();
  }

  public async deleteFromFavorite(offerId: string, userId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } }).exec();
  }
}
