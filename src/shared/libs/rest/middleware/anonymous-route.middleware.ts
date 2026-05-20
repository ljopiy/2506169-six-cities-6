import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../index.js';

export class AnonymousRouteMiddleware implements Middleware {
  public async execute({ tokenPayload }: Request, _res: Response, next: NextFunction): Promise<void> {
    if (tokenPayload) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'This route is available only for anonymous users',
        'AnonymousRouteMiddleware'
      );
    }

    return next();
  }
}