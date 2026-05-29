import { ErrorType, HttpError } from '../../../libs/rest/index.js';

export class BaseUserException extends HttpError {
  constructor(httpStatusCode: number, message: string) {
    super(httpStatusCode, message, undefined, ErrorType.Authorization);
  }
}
