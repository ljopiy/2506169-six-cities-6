import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  PrivateRouteMiddleware,
  RequestQuery,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import { inject, injectable } from 'inversify';
import { CityName, Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OfferService } from './offer-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { prepareOffer } from '../../helpers/index.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { OfferPreviewRdo } from './rdo/offer-preview.rdo.js';
import { CommentService } from '../comment/index.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CreateOfferRequest } from './types/create-offer-request.type.js';
import { UpdateOfferRequest } from './types/update-offer-request.type.js';
import { ParamOfferId } from './types/param-offerid.type.js';
import { ParamOfferCity } from './types/param-offer-city.type.js';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { TokenPayload } from '../auth/index.js';

@injectable()
export default class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController');
    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.findPremium });
    this.addRoute({
      path: '/favorite',
      method: HttpMethod.Get,
      handler: this.findFavorite,
      middlewares: [
        new PrivateRouteMiddleware()
      ]
    });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
  }

  public async create(
    req: CreateOfferRequest,
    res: Response
  ): Promise<void> {
    const userId = this.getRequiredUserId(req);
    const result = await this.offerService.create({
      ...req.body,
      authorId: userId,
      commentsCount: 0
    });
    this.created(res, fillDTO(OfferRdo, this.mapOffer(result, userId)));
  }

  public async index(
    req: Request,
    res: Response
  ): Promise<void> {
    const query = req.query as RequestQuery;
    const limit = Number(query.limit);
    const offers = await this.offerService.find(Number.isNaN(limit) || limit <= 0 ? undefined : limit);
    const userId = this.getCurrentUserId(req);

    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => this.mapOffer(offer, userId))));
  }

  public async show(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const existsOffer = await this.offerService.findById(offerId);
    const userId = this.getCurrentUserId(req);

    if (!existsOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, this.mapOffer(existsOffer, userId)));
  }

  public async update(
    req: UpdateOfferRequest,
    res: Response
  ): Promise<void> {
    const typedParams = req.params as ParamOfferId;
    const offerId = this.extractParam(typedParams.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.ensureOfferOwner(offerId, userId);

    const result = await this.offerService.updateById(offerId, req.body);
    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, this.mapOffer(result, userId)));
  }

  public async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.ensureOfferOwner(offerId, userId);

    await this.offerService.deleteById(offerId);
    await this.commentService.deleteByOfferId(offerId);
    this.noContent(res, null);
  }

  public async findPremium(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferCity;
    const city = this.extractParam(params.city, 'city');

    if (!Object.values(CityName).includes(city as CityName)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${city} is invalid city`,
        'OfferController',
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    const userId = this.getCurrentUserId(req);

    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => this.mapOffer(offer, userId))));
  }

  public async findFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = this.getRequiredUserId(req);
    const offers = await this.offerService.findFavorite(userId);
    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => this.mapOffer(offer, userId))));
  }

  public async addToFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.offerService.addToFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, this.mapOffer(result, userId)));
  }

  public async deleteFromFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.offerService.deleteFromFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, this.mapOffer(result, userId)));
  }

  private getCurrentUserId(req: { tokenPayload?: TokenPayload }): string | undefined {
    return req.tokenPayload?.id;
  }

  private getRequiredUserId(req: { tokenPayload?: TokenPayload }): string {
    const userId = this.getCurrentUserId(req);

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'OfferController',
      );
    }

    return userId;
  }

  private mapOffer(offer: DocumentType<OfferEntity>, userId?: string) {
    const preparedOffer = prepareOffer(offer);
    const favoriteByUsers = offer.favoriteByUsers ?? [];
    const isFavorite = userId
      ? favoriteByUsers.some((favoriteUser) => this.extractRefId(favoriteUser) === userId)
      : false;

    return {
      ...preparedOffer,
      isFavorite
    };
  }

  private async ensureOfferOwner(offerId: string, userId: string): Promise<void> {
    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    const authorId = this.extractRefId(offer.authorId);

    if (authorId !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only the author can manage this offer',
        'OfferController',
      );
    }
  }

  private extractRefId(entity: unknown): string {
    if (typeof entity === 'string') {
      return entity;
    }

    if (typeof entity === 'object' && entity !== null && '_id' in entity) {
      return String((entity as { _id: unknown })._id);
    }

    return String(entity);
  }

  private extractParam(param: unknown, name: string): string {
    const value = Array.isArray(param) ? param[0] : param;

    if (typeof value !== 'string') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${name} is invalid`,
        'OfferController',
      );
    }

    return value.trim();
  }
}
