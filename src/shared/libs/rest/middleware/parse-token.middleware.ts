import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { StatusCodes } from 'http-status-codes';
import { createSecretKey } from 'node:crypto';
import { Middleware } from './middleware.interface.js';
import { ErrorType, HttpError } from '../errors/index.js';
import { TokenPayload } from '../../../modules/auth/index.js';

const AUTH_MIDDLEWARE_NAME = 'AuthenticateMiddleware';
const ENCODING = 'utf-8';

function isTokenPayload(payload: unknown): payload is TokenPayload {
  return (
    (typeof payload === 'object' && payload !== null) &&
    ('email' in payload && typeof payload.email === 'string') &&
    ('name' in payload && typeof payload.name === 'string') &&
    ('id' in payload && typeof payload.id === 'string')
  );
}

export class ParseTokenMiddleware implements Middleware {
  constructor(private readonly jwtSecret: string) { }

  private static createInvalidTokenError(): HttpError {
    return new HttpError(
      StatusCodes.UNAUTHORIZED,
      'Invalid token',
      AUTH_MIDDLEWARE_NAME,
      ErrorType.Authorization
    );
  }

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next();
    }

    const [schema, token] = authorizationHeader.split(' ');

    if (schema !== 'Bearer' || !token) {
      return next(ParseTokenMiddleware.createInvalidTokenError());
    }

    try {
      const { payload } = await jwtVerify(token, createSecretKey(this.jwtSecret, ENCODING));

      if (isTokenPayload(payload)) {
        req.tokenPayload = { ...payload };
        return next();
      }

      return next(ParseTokenMiddleware.createInvalidTokenError());
    } catch {
      return next(ParseTokenMiddleware.createInvalidTokenError());
    }
  }
}
