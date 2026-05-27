import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  PrivateRouteMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import { inject, injectable } from 'inversify';
import { CityName, Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OfferService } from './offer-service.interface.js';
import { fillDTO, prepareOffer, extractRefId } from '../../helpers/index.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { OfferPreviewRdo } from './rdo/offer-preview.rdo.js';
import { CommentService } from '../comment/index.js';
import { UserService } from '../user/user-service.interface.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CreateOfferRequest } from './types/create-offer-request.type.js';
import { UpdateOfferRequest } from './types/update-offer-request.type.js';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { TokenPayload } from '../auth/index.js';

@injectable()
export default class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController');
    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.listOffers });
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
      handler: this.getOfferById,
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
      rating: 0,
      authorId: userId,
      commentsCount: 0,
    });

    const [mappedOffer] = await this.mapOffersForUser([result], userId);
    this.created(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async listOffers(
    req: Request,
    res: Response
  ): Promise<void> {
    const limit = this.extractLimit(req.query.limit);
    const offers = await this.offerService.find(limit);
    const userId = this.getCurrentUserId(req);

    this.ok(res, fillDTO(OfferPreviewRdo, await this.mapOffersForUser(offers, userId)));
  }

  public async getOfferById(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractParam(req.params.offerId, 'offerId');
    const existingOffer = await this.offerService.findById(offerId);
    const userId = this.getCurrentUserId(req);

    const [mappedOffer] = await this.mapOffersForUser([this.requireDocument(existingOffer, 'show')], userId);
    this.ok(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async update(
    req: UpdateOfferRequest,
    res: Response
  ): Promise<void> {
    const offerId = this.extractParam(req.params.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.ensureOfferOwner(offerId, userId);

    const result = await this.offerService.updateById(offerId, req.body);
    const [mappedOffer] = await this.mapOffersForUser([this.requireDocument(result, 'update')], userId);
    this.ok(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractParam(req.params.offerId, 'offerId');
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
    const city = this.extractParam(req.params.city, 'city');

    if (!this.isCityName(city)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${city} is invalid city`,
        'OfferController',
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    const userId = this.getCurrentUserId(req);

    this.ok(res, fillDTO(OfferPreviewRdo, await this.mapOffersForUser(offers, userId)));
  }

  public async findFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = this.getRequiredUserId(req);
    const offers = await this.offerService.findFavorite(userId);
    this.ok(res, fillDTO(OfferPreviewRdo, await this.mapOffersForUser(offers, userId)));
  }

  public async addToFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractParam(req.params.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.offerService.addToFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);
    const [mappedOffer] = await this.mapOffersForUser([this.requireDocument(result, 'addToFavorite')], userId);
    this.ok(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async deleteFromFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractParam(req.params.offerId, 'offerId');
    const userId = this.getRequiredUserId(req);

    await this.offerService.deleteFromFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);
    const [mappedOffer] = await this.mapOffersForUser([this.requireDocument(result, 'deleteFromFavorite')], userId);
    this.ok(res, fillDTO(OfferRdo, mappedOffer));
  }

  private getCurrentUserId(req: { tokenPayload?: TokenPayload }): string | undefined {
    return req.tokenPayload?.id;
  }

  private getRequiredUserId(req: { tokenPayload?: TokenPayload }): string {
    const userId = req.tokenPayload?.id;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'OfferController',
      );
    }

    return userId;
  }

  private async mapOffersForUser(
    offers: DocumentType<OfferEntity>[],
    userId?: string
  ): Promise<Array<ReturnType<typeof prepareOffer> & { isFavorite: boolean }>> {
    const favoriteOfferIds = await this.getFavoriteOfferIdSet(userId);

    return offers.map((offer) => this.mapOffer(offer, favoriteOfferIds));
  }

  private mapOffer(offer: DocumentType<OfferEntity>, favoriteOfferIds: Set<string>) {
    const preparedOffer = prepareOffer(offer);

    return {
      ...preparedOffer,
      isFavorite: favoriteOfferIds.has(String(offer._id))
    };
  }

  private async getFavoriteOfferIdSet(userId?: string): Promise<Set<string>> {
    if (!userId) {
      return new Set<string>();
    }

    const user = await this.userService.findById(userId);
    const favoriteOffers = user?.favoriteOffers ?? [];

    return new Set<string>(favoriteOffers.map((favoriteOffer) => extractRefId(favoriteOffer)));
  }

  private async ensureOfferOwner(offerId: string, userId: string): Promise<void> {
    const offer = await this.offerService.findById(offerId);
    const authorId = extractRefId(this.requireDocument(offer, 'ensureOfferOwner').authorId);

    if (authorId !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only the author can manage this offer',
        'OfferController',
      );
    }
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

  private extractLimit(limitParam: unknown): number | undefined {
    const limit = Number(Array.isArray(limitParam) ? limitParam[0] : limitParam);
    return Number.isNaN(limit) || limit <= 0 ? undefined : limit;
  }

  private isCityName(city: string): city is CityName {
    return Object.values(CityName).some((cityName) => cityName === city);
  }

  private requireDocument<T>(document: T | null, action: string): T {
    if (document === null) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer is not found (${action}).`,
        'OfferController',
      );
    }

    return document;
  }
}
