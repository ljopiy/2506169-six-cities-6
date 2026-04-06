import { CreateOfferDto } from './dto/create-offer.dto.js';
import { DocumentType } from '@typegoose/typegoose';
import { DeleteResult } from 'mongoose';
import { OfferEntity } from './offer.entity.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';


export interface OfferService {
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  find(): Promise<DocumentType<OfferEntity>[]>;
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
