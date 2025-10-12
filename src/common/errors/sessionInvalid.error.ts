import { CustomError } from './cutom.error';

/*
 * Custom error used when session is invalid. returns 401
 */
export class SessionInvalidError extends CustomError {
  statusCode = 401;
  constructor() {
    super('Auth token invalid');
    Object.setPrototypeOf(this, SessionInvalidError.prototype);
  }

  serializeErrors() {
    return { status: this.statusCode, message: 'Auth token invalid' };
  }
}
