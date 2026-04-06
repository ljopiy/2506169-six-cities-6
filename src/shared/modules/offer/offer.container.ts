import { Container } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferEntity, OfferModel } from './offer.entity.js';
import { types } from '@typegoose/typegoose';

export function createOfferContainer(container: Container): void {
  container.bind<OfferService>(Component.OfferService)
    .to(DefaultOfferService)
    .inSingletonScope();

  container.bind<types.ModelType<OfferEntity>>(Component.OfferModel)
    .toConstantValue(OfferModel);
}
