import { StatusCodes } from 'http-status-codes';
import { BaseUserException } from './base-user.exception.js';

export class UserNotFoundException extends BaseUserException {
  constructor() {
    super(StatusCodes.UNAUTHORIZED, 'Incorrect email or password');
  }
}
