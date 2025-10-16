import { Global, Module } from '@nestjs/common';
import { UtilsModule } from './utils/utils.module';
import { AuthUtilsModule } from './session/authUtils.module';
import { PaginationServiceModule } from './pagination/pagination.module';

@Global()
@Module({
  imports: [UtilsModule, AuthUtilsModule, PaginationServiceModule],
  exports: [UtilsModule, AuthUtilsModule, PaginationServiceModule],
})
export class CommonModule {}
