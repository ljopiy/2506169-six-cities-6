import {
  BaseController,
  DocumentExistsMiddleware,
  ErrorType,
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

const CONTROLLER_NAME = 'OfferController';
const OFFER_ENTITY_NAME = 'Offer';
const OFFER_ID_PARAM_NAME = 'offerId';
const OFFER_CITY_PARAM_NAME = 'city';

const enum OfferAction {
  Show = 'show',
  Update = 'update',
  AddToFavorite = 'addToFavorite',
  DeleteFromFavorite = 'deleteFromFavorite',
  EnsureOwner = 'ensureOwner',
}

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
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME),
        new DocumentExistsMiddleware(this.offerService, OFFER_ENTITY_NAME, OFFER_ID_PARAM_NAME)
      ]
    });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME),
        new DocumentExistsMiddleware(this.offerService, OFFER_ENTITY_NAME, OFFER_ID_PARAM_NAME)
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME)
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME),
        new ValidateDtoMiddleware(UpdateOfferDto)
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME)
      ]
    });
  }

  public async show(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractStringParam(req.params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);
    const userId = this.getCurrentUserId(req);

    const [mappedOffer] = await this.mapForUser([await this.findByIdOrThrow(offerId, OfferAction.Show)], userId);
    this.ok(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async index(
    req: Request,
    res: Response
  ): Promise<void> {
    const limit = OfferController.extractLimit(req.query.limit);
    const offers = await this.offerService.find(limit);
    const userId = this.getCurrentUserId(req);

    this.ok(res, fillDTO(OfferPreviewRdo, await this.mapForUser(offers, userId)));
  }

  public async create(
    req: CreateOfferRequest,
    res: Response
  ): Promise<void> {
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);
    const result = await this.offerService.create({
      ...req.body,
      isFavorite: false,
      rating: 0,
      authorId: userId,
      commentsCount: 0,
    });

    const [mappedOffer] = await this.mapForUser([result], userId);
    this.created(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractStringParam(req.params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    await this.ensureOwner(offerId, userId);

    await this.offerService.deleteById(offerId);
    await this.commentService.deleteByOfferId(offerId);
    this.noContent(res);
  }

  public async update(
    req: UpdateOfferRequest,
    res: Response
  ): Promise<void> {
    const offerId = this.extractStringParam(req.params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    await this.ensureOwner(offerId, userId);

    const result = await this.offerService.updateById(offerId, req.body);
    const [mappedOffer] = await this.mapForUser(
      [this.requireDocument(result, OFFER_ENTITY_NAME, OfferAction.Update, CONTROLLER_NAME)],
      userId
    );
    this.ok(res, fillDTO(OfferRdo, mappedOffer));
  }

  public async findPremium(
    req: Request,
    res: Response
  ): Promise<void> {
    const city = this.extractStringParam(req.params.city, OFFER_CITY_PARAM_NAME, CONTROLLER_NAME);

    if (!OfferController.isCityName(city)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${city} is invalid city`,
        CONTROLLER_NAME,
        ErrorType.Validation
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    const userId = this.getCurrentUserId(req);

    this.ok(res, fillDTO(OfferPreviewRdo, await this.mapForUser(offers, userId)));
  }

  public async findFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);
    const offers = await this.offerService.findFavorite(userId);
    this.ok(res, fillDTO(OfferPreviewRdo, await this.mapForUser(offers, userId)));
  }

  public async addToFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractStringParam(req.params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    await this.offerService.addToFavorite(offerId, userId);
    this.ok(res, fillDTO(OfferRdo, await this.getMappedById(offerId, userId, OfferAction.AddToFavorite)));
  }

  public async deleteFromFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const offerId = this.extractStringParam(req.params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    await this.offerService.deleteFromFavorite(offerId, userId);
    this.ok(res, fillDTO(OfferRdo, await this.getMappedById(offerId, userId, OfferAction.DeleteFromFavorite)));
  }

  private async mapForUser(
    offers: DocumentType<OfferEntity>[],
    userId?: string
  ): Promise<Array<ReturnType<typeof prepareOffer> & { isFavorite: boolean }>> {
    const favoriteIds = await this.getFavoriteIdSet(userId);

    return offers.map((offer) => this.map(offer, favoriteIds));
  }

  private map(offer: DocumentType<OfferEntity>, favoriteIds: Set<string>) {
    const preparedOffer = prepareOffer(offer);

    return {
      ...preparedOffer,
      isFavorite: favoriteIds.has(String(offer._id))
    };
  }

  private async getFavoriteIdSet(userId?: string): Promise<Set<string>> {
    if (!userId) {
      return new Set<string>();
    }

    const user = await this.userService.findById(userId);
    const favoriteOffers = user?.favoriteOffers ?? [];

    return new Set<string>(favoriteOffers.map((favoriteOffer) => extractRefId(favoriteOffer)));
  }

  private async ensureOwner(offerId: string, userId: string): Promise<void> {
    const offer = await this.findByIdOrThrow(offerId, OfferAction.EnsureOwner);
    const authorId = extractRefId(offer.authorId);

    if (authorId !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'Only the author can manage this offer',
        CONTROLLER_NAME,
        ErrorType.Authorization
      );
    }
  }

  private static extractLimit(limitParam: unknown): number | undefined {
    const limit = Number(Array.isArray(limitParam) ? limitParam[0] : limitParam);
    return Number.isNaN(limit) || limit <= 0 ? undefined : limit;
  }

  private static isCityName(city: string): city is CityName {
    return Object.values(CityName).some((cityName) => cityName === city);
  }

  private async getMappedById(offerId: string, userId: string, action: OfferAction) {
    const [mappedOffer] = await this.mapForUser([await this.findByIdOrThrow(offerId, action)], userId);
    return mappedOffer;
  }

  private async findByIdOrThrow(offerId: string, action: OfferAction): Promise<DocumentType<OfferEntity>> {
    const offer = await this.offerService.findById(offerId);
    return this.requireDocument(offer, OFFER_ENTITY_NAME, action, CONTROLLER_NAME);
  }
}
