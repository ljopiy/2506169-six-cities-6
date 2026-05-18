import { Middleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import { DocumentExists } from '../../../types/index.js';
import { HttpError } from '../errors/index.js';
import { StatusCodes } from 'http-status-codes';

export class DocumentExistsMiddleware implements Middleware {
  constructor(
    private readonly service: DocumentExists,
    private readonly entityName: string,
    private readonly paramName: string,
  ) {}

  public async execute({ params }: Request, _res: Response, next: NextFunction): Promise<void> {
    const paramValue = params[this.paramName];
    const documentId = Array.isArray(paramValue) ? paramValue[0] : paramValue;

    if (!documentId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${this.paramName} is required.`,
        'DocumentExistsMiddleware'
      );
    }

    if (! await this.service.exists(documentId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `${this.entityName} with ${documentId} not found.`,
        'DocumentExistsMiddleware'
      );
    }

    next();
  }
}
