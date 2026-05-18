import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  RequestQuery,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OfferService } from './offer-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { prepareOffer } from '../../helpers/index.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { CommentService } from '../comment/index.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CreateOfferRequest } from './types/create-offer-request.type.js';
import { UpdateOfferRequest } from './types/update-offer-request.type.js';
import { ParamOfferId } from './types/param-offerid.type.js';
import { ParamOfferCity } from './types/param-offer-city.type.js';

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
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.findPremium });
    this.addRoute({ path: '/favorite', method: HttpMethod.Get, handler: this.findFavorite });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
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
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
  }

  public async create(
    { body }: CreateOfferRequest,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.create(body);
    this.created(res, fillDTO(OfferRdo, prepareOffer(result)));
  }

  public async index(
    req: Request,
    res: Response
  ): Promise<void> {
    const query = req.query as RequestQuery;
    const limit = Number(query.limit);
    const offers = await this.offerService.find(Number.isNaN(limit) || limit <= 0 ? undefined : limit);
    this.ok(res, fillDTO(OfferRdo, offers.map((offer) => prepareOffer(offer))));
  }

  public async show(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const existsOffer = await this.offerService.findById(offerId);

    if (!existsOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(existsOffer)));
  }

  public async update(
    { body, params }: UpdateOfferRequest,
    res: Response
  ): Promise<void> {
    const typedParams = params as ParamOfferId;
    const offerId = this.extractParam(typedParams.offerId, 'offerId');

    const result = await this.offerService.updateById(offerId, body);
    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(result)));
  }

  public async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');

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
    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferRdo, offers.map((offer) => prepareOffer(offer))));
  }

  public async findFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = this.getUserId(req);
    const offers = await this.offerService.findFavorite(userId);
    this.ok(res, fillDTO(OfferRdo, offers.map((offer) => prepareOffer(offer))));
  }

  public async addToFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = this.getUserId(req);

    await this.offerService.addToFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(result)));
  }

  public async deleteFromFavorite(
    req: Request,
    res: Response
  ): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = this.getUserId(req);

    await this.offerService.deleteFromFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController',
      );
    }

    this.ok(res, fillDTO(OfferRdo, prepareOffer(result)));
  }

  private getUserId(req: Request): string {
    const userId = req.headers['x-user-id'];
    const value = Array.isArray(userId) ? userId[0] : userId;

    if (!value) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'OfferController',
      );
    }

    return value;
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
