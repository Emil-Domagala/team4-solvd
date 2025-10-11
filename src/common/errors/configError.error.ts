import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Error thrown when a required configuration or environment variable
 * is missing or invalid. Automatically results in a 500 response.
 */
export class ConfigError extends HttpException {
  constructor(message: string) {
    super(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Configuration Error',
        message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
