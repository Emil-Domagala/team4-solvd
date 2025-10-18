import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomError } from '../errors/custom.error';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle CustomError hierarchy
    if (exception instanceof CustomError) {
      const serialized = exception.serializeErrors();
      return response.status(serialized.status).json({
        statusCode: serialized.status,
        message: serialized.message,
        fields: serialized.fields || [],
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Handle standard NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(typeof res === 'string' ? { message: res } : res),
      });
    }

    // Fallback for unexpected errors
    this.logger.error('Unexpected error occurred', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
