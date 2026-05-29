import { inject, injectable } from 'inversify';
import { Response } from 'express';
import { Logger } from '../../libs/logger/index.js';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
  PrivateRouteMiddleware
} from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { CommentService } from './comment-service.interface.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { CreateCommentRequest } from './types/create-comment-request.type.js';
import { GetCommentsRequest } from './types/get-comments-request.type.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { fillDTO } from '../../helpers/index.js';
import { CommentRdo } from './rdo/comment.rdo.js';

const CONTROLLER_NAME = 'CommentController';
const OFFER_ENTITY_NAME = 'Offer';
const OFFER_ID_PARAM_NAME = 'offerId';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController');

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME),
        new DocumentExistsMiddleware(this.offerService, OFFER_ENTITY_NAME, OFFER_ID_PARAM_NAME)
      ]
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware(OFFER_ID_PARAM_NAME),
        new ValidateDtoMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, OFFER_ENTITY_NAME, OFFER_ID_PARAM_NAME)
      ]
    });
  }

  public async index(
    { params }: GetCommentsRequest,
    res: Response,
  ): Promise<void> {
    const offerId = this.extractStringParam(params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);

    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create(
    req: CreateCommentRequest,
    res: Response,
  ): Promise<void> {
    const offerId = this.extractStringParam(req.params.offerId, OFFER_ID_PARAM_NAME, CONTROLLER_NAME);
    const userId = this.getRequiredUserId(req, CONTROLLER_NAME);

    const result = await this.commentService.create({
      ...req.body,
      offerId,
      authorId: userId,
    });

    await this.offerService.incCommentCount(offerId);
    await this.offerService.recalculateRating(offerId);

    this.created(res, fillDTO(CommentRdo, result));
  }
}
