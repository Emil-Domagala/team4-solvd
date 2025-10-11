import { CustomError } from 'src/common/errors/cutom.error';

/**
 * Error thrown when email or password is invalid
 *
 * Results in a **400 Bad Request** response.
 */
export class UserLoginError extends CustomError {
  statusCode = 400;

  constructor() {
    super('Password or user not found');
    Object.setPrototypeOf(this, UserLoginError.prototype);
  }

  serializeErrors() {
    return {
      status: this.statusCode,
      message: this.message,
    };
  }
}
