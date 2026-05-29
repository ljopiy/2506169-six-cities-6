import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { Middleware } from './middleware.interface.js';
import { ErrorType, HttpError } from '../errors/index.js';
import { StatusCodes } from 'http-status-codes';
import { removeFileIfExists } from '../../../helpers/file-system.js';

export class ValidateDtoMiddleware implements Middleware {
  constructor(private dto: ClassConstructor<object>) {}

  private static getMessages(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => {
      const messages = Object.values(error.constraints ?? {});
      const childMessages = ValidateDtoMiddleware.getMessages(error.children ?? []);
      return [...messages, ...childMessages];
    });
  }

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dto, req.body);
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      await removeFileIfExists(req.file?.path);
      const message = ValidateDtoMiddleware.getMessages(errors).join('; ') || 'Validation failed';

      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        message,
        'ValidateDtoMiddleware',
        ErrorType.Validation
      );
    }

    req.body = dtoInstance;
    next();
  }
}
