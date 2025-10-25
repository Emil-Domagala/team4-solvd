import {
  Catch,
  ArgumentsHost,
  WsExceptionFilter,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CustomError } from '../errors/custom.error';

@Catch()
export class CustomWsExceptionFilter implements WsExceptionFilter {
  private readonly logger = new Logger(CustomWsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const now = new Date().toISOString();

    if (exception instanceof CustomError) {
      const serialized = exception.serializeErrors();
      client.emit('error', {
        statusCode: serialized.status,
        message: serialized.message,
        fields: serialized.fields || [],
        timestamp: now,
      });
      return;
    }

    // Handle standard NestJS WsException
    if (exception instanceof WsException) {
      const error = exception.getError();
      const message =
        typeof error === 'string' ? error : (error as WsException).message;
      client.emit('error', {
        statusCode: 400,
        message,
        timestamp: now,
      });
      return;
    }

    // Unknown case
    this.logger.error('Unexpected error occurred', exception);
    client.emit('error', {
      statusCode: 500,
      message: 'Internal server error',
      timestamp: now,
    });
  }
}
