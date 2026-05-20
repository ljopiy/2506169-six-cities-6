import { CreateOfferServiceDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { DeleteResult } from 'mongoose';

export interface OfferService {
  create(dto: CreateOfferServiceDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  find(limit?: number): Promise<DocumentType<OfferEntity>[]>;
  deleteById(offerId: string): Promise<DeleteResult>;
  updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null>;
  findPremiumByCity(cityName: string): Promise<DocumentType<OfferEntity>[]>;
  findFavorite(userId: string): Promise<DocumentType<OfferEntity>[]>;
  addToFavorite(offerId: string, userId: string): Promise<void>;
  deleteFromFavorite(offerId: string, userId: string): Promise<void>;
  incCommentCount(offerId: string): Promise<void>;
  recalculateRating(offerId: string): Promise<void>;
  exists(documentId: string): Promise<boolean>;
}
