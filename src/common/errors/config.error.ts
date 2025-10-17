import { CustomError } from './custom.error';

/**
 * Error thrown when a required configuration or environment variable is missing or invalid.
 *
 * Results in a **500 Internal Server Error** response.
 */
export class ConfigError extends CustomError {
  statusCode = 500;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigError.prototype);
  }

  serializeErrors() {
    return {
      status: this.statusCode,
      message: this.message,
    };
  }
}
