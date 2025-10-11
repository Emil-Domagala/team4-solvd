import { CustomError } from 'src/common/errors/cutom.error';

/**
 * Error thrown when email is already taken
 *
 * Results in a **400 Bad request** response.
 */
export class EmailIsAlreadyTakenError extends CustomError {
  statusCode = 400;

  constructor() {
    super('Email is already taken');
    Object.setPrototypeOf(this, EmailIsAlreadyTakenError.prototype);
  }

  serializeErrors() {
    return {
      status: this.statusCode,
      message: this.message,
    };
  }
}
