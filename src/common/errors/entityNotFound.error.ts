import { CustomError } from './custom.error';

/**
 * Error thrown when entity not found
 *
 * Results in a **404 Not Found** response.
 */
export class EntityNotFoundError extends CustomError {
  statusCode = 404;

  constructor(entity: string) {
    super(`${entity} not found.`);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }

  serializeErrors() {
    return {
      status: this.statusCode,
      message: this.message,
    };
  }
}
