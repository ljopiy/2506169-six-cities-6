import { NextFunction, Request, Response } from 'express';
import multer, { diskStorage } from 'multer';
import { extension } from 'mime-types';
import { nanoid } from 'nanoid';
import { Middleware } from './middleware.interface.js';
import { ErrorType, HttpError } from '../errors/index.js';
import { StatusCodes } from 'http-status-codes';
import { mkdirSync } from 'node:fs';

const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

export class UploadFileMiddleware implements Middleware {
  constructor(
    private uploadDirectory: string,
    private fieldName: string,
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    mkdirSync(this.uploadDirectory, { recursive: true });

    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const fileExtension = extension(file.mimetype);

        if (!fileExtension) {
          callback(new HttpError(
            StatusCodes.BAD_REQUEST,
            `Cannot resolve extension for mimetype ${file.mimetype}`,
            'UploadFileMiddleware',
            ErrorType.Validation
          ), '');
          return;
        }

        const filename = nanoid();
        callback(null, `${filename}.${fileExtension}`);
      }
    });

    const uploadSingleFileMiddleware = multer({
      storage,
      fileFilter: (_req, file, callback) => {
        const isAllowed = ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype);

        if (!isAllowed) {
          callback(new HttpError(
            StatusCodes.BAD_REQUEST,
            'Only .png and .jpg images are allowed',
            'UploadFileMiddleware',
            ErrorType.Validation
          ));
          return;
        }

        callback(null, true);
      },
    })
      .single(this.fieldName);

    uploadSingleFileMiddleware(req, res, next);
  }
}
