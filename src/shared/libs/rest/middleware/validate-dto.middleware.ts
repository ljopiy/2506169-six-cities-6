import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../index.js';

export class ValidateDtoMiddleware implements Middleware {
  constructor(private dto: ClassConstructor<object>) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dto, req.body);
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      const message = errors
        .flatMap((error) => Object.values(error.constraints ?? {}))
        .join('; ') || 'Validation failed';

      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        message,
        'ValidateDtoMiddleware'
      );
    }
    req.body = dtoInstance as Request['body'];
    next();
  }
}
