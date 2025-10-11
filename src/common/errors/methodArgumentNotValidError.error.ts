import { CustomError, ErrorsArr } from './cutomError.error';

/**
 * Error thrown when request validation fails due to invalid or missing arguments.
 *
 * used for schema validation on body/query/params if request do not match the expected format.
 *
 * Results in a **400 Bad Request** response.
 */
export class MethodArgumentNotValidError extends CustomError {
  statusCode = 400;

  constructor(
    message: string,
    private readonly errorsArr?: ErrorsArr,
  ) {
    super(message);
    Object.setPrototypeOf(this, MethodArgumentNotValidError.prototype);
  }

  serializeErrors() {
    return {
      status: this.statusCode,
      message: this.message,
      fields: this.errorsArr,
    };
  }
}
