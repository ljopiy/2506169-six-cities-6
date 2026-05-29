import { ErrorType } from './error-type.enum.js';

export type ErrorResponse = {
  type: ErrorType;
  error: string;
};
