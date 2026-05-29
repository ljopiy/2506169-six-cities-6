import { injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Controller } from './controller.interface.js';
import { Logger } from '../../logger/index.js';
import { Route } from '../types/route.interface.js';
import { HttpError } from '../errors/http-error.js';
import { ErrorType } from '../errors/error-type.enum.js';

const DEFAULT_CONTENT_TYPE = 'application/json';

@injectable()
export abstract class BaseController implements Controller {
  private readonly _router: Router;

  constructor(
    protected readonly logger: Logger
  ) {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  public addRoute(route: Route): void {
    const wrapperAsyncHandler = asyncHandler(route.handler.bind(this));
    const middlewareHandlers = route.middlewares?.map((middleware) => asyncHandler(middleware.execute.bind(middleware)));
    const routeHandlers = middlewareHandlers ? [...middlewareHandlers, wrapperAsyncHandler] : wrapperAsyncHandler;
    this._router[route.method](route.path, routeHandlers);
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}`);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res
      .type(DEFAULT_CONTENT_TYPE)
      .status(statusCode)
      .json(data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  protected getCurrentUserId(req: { tokenPayload?: { id: string } }): string | undefined {
    return req.tokenPayload?.id;
  }

  protected getRequiredUserId(req: { tokenPayload?: { id: string } }, source: string): string {
    const userId = this.getCurrentUserId(req);

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized user',
        source,
        ErrorType.Authorization
      );
    }

    return userId;
  }

  protected extractStringParam(param: unknown, name: string, source: string): string {
    const value = Array.isArray(param) ? param[0] : param;

    if (typeof value !== 'string') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${name} is invalid`,
        source,
        ErrorType.Validation
      );
    }

    return value.trim();
  }

  protected requireDocument<T>(
    document: T | null,
    entityName: string,
    action: string,
    source: string
  ): T {
    if (document === null) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `${entityName} is not found (${action}).`,
        source,
      );
    }

    return document;
  }
}
