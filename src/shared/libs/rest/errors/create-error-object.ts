import { ErrorType } from './error-type.enum.js';
import { ErrorResponse } from './error-response.type.js';

export function createErrorObject(message: string, type: ErrorType): ErrorResponse {
  return {
    type,
    error: message,
  };
}
