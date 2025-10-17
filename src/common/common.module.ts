import { Global, Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';
import { AuthUtilsModule } from './session/authUtils.module';
import { PaginationServiceModule } from './pagination/pagination.module';
import { SocketModule } from './socket/socket.module';

@Global()
@Module({
  imports: [
    UtilsModule,
    AuthUtilsModule,
    PaginationServiceModule,
    SocketModule,
  ],
  exports: [
    UtilsModule,
    AuthUtilsModule,
    PaginationServiceModule,
    SocketModule,
  ],
})
export class CommonModule {}
