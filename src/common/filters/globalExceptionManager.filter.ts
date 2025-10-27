import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { CustomExceptionFilter } from './customException.filter';
import { CustomWsExceptionFilter } from './customWsException.filter';

@Catch()
export class GlobalExceptionManagerFilter implements ExceptionFilter {
  private readonly httpFilter = new CustomExceptionFilter();
  private readonly wsFilter = new CustomWsExceptionFilter();

  catch(exception: unknown, host: ArgumentsHost) {
    switch (host.getType()) {
      case 'http':
        return this.httpFilter.catch(exception, host);
      case 'ws':
        return this.wsFilter.catch(exception, host);
      default:
        return this.httpFilter.catch(exception, host);
    }
  }
}
