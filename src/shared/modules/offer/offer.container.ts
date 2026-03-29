import { ContainerModule } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferEntity, OfferModel } from './offer.entity.js';
import { types } from '@typegoose/typegoose';

export function createOfferContainer(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind<OfferService>(Component.OfferService)
      .to(DefaultOfferService);

    bind<types.ModelType<OfferEntity>>(Component.OfferModel)
      .toConstantValue(OfferModel);
  });
}
