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
  ValidateObjectIdMiddleware,
  PrivateRouteMiddleware
} from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';
import { CommentService } from './comment-service.interface.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { CreateCommentRequest } from './types/create-comment-request.type.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { fillDTO } from '../../helpers/index.js';
import { CommentRdo } from './rdo/comment.rdo.js';

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
      handler: this.listComments,
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
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
  }

  public async listComments(
    { params }: CreateCommentRequest,
    res: Response,
  ): Promise<void> {
    const offerId = this.extractOfferId(params.offerId);

    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create(
    req: CreateCommentRequest,
    res: Response,
  ): Promise<void> {
    const offerId = this.extractOfferId(req.params.offerId);
    const userId = this.getRequiredUserId(req);

    const result = await this.commentService.create({
      ...req.body,
      offerId,
      authorId: userId,
    });

    await this.offerService.incCommentCount(offerId);
    await this.offerService.recalculateRating(offerId);

    this.created(res, fillDTO(CommentRdo, result));
  }

  private getRequiredUserId(req: { tokenPayload?: { id: string } }): string {
    const userId = req.tokenPayload?.id;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        'CommentController'
      );
    }

    return userId;
  }

  private extractOfferId(offerIdParam: unknown): string {
    if (typeof offerIdParam !== 'string') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'offerId is invalid',
        'CommentController'
      );
    }

    return offerIdParam.trim();
  }
}
