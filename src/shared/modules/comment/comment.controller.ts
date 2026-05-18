import { inject, injectable } from 'inversify';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../libs/logger/index.js';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { CommentService } from './comment-service.interface.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { CreateCommentRequest } from './types/create-comment-request.type.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { fillDTO } from '../../helpers/index.js';
import { CommentRdo } from './rdo/comment.rdo.js';

type OfferIdParam = {
  offerId: string;
};

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
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
  }

  public async index(
    { params }: CreateCommentRequest,
    res: Response,
  ): Promise<void> {
    const offerId = (params as OfferIdParam).offerId.trim();

    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create(
    { body, params, headers }: CreateCommentRequest,
    res: Response,
  ): Promise<void> {
    const offerId = (params as OfferIdParam).offerId.trim();

    const userId = this.getUserId(headers['x-user-id']);
    const result = await this.commentService.create({
      ...body,
      offerId,
      authorId: userId,
    });

    await this.offerService.incCommentCount(offerId);
    await this.offerService.recalculateRating(offerId);

    this.created(res, fillDTO(CommentRdo, result));
  }

  private getUserId(userId: string | string[] | undefined): string {
    const value = Array.isArray(userId) ? userId[0] : userId;

    if (!value) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'CommentController',
      );
    }

    return value;
  }
}
