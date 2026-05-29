import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { ExceptionFilter } from './exception-filter.interface.js';
import { Logger } from '../../logger/index.js';
import { Component } from '../../../types/index.js';
import { createErrorObject, ErrorType, HttpError } from '../errors/index.js';

@injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {
    this.logger.info('Register AppExceptionFilter');
  }

  private static getErrorType(error: HttpError): ErrorType {
    if (error.errorType) {
      return error.errorType;
    }

    if ([StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].includes(error.httpStatusCode)) {
      return ErrorType.Authorization;
    }

    if (error.httpStatusCode === StatusCodes.BAD_REQUEST) {
      return ErrorType.Validation;
    }

    return ErrorType.Common;
  }

  private handleHttpError(error: HttpError, _req: Request, res: Response, _next: NextFunction) {
    this.logger.error(`[${error.detail}]: ${error.httpStatusCode} — ${error.message}`, error);
    res
      .status(error.httpStatusCode)
      .json(createErrorObject(error.message, AppExceptionFilter.getErrorType(error)));
  }

  private handleOtherError(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));

    this.logger.error(normalizedError.message, normalizedError);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createErrorObject(normalizedError.message, ErrorType.Common));
  }

  public catch(error: unknown, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, req, res, next);
    }

    this.handleOtherError(error, req, res, next);
  }
}
