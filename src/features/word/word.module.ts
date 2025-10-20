import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordEntity } from './word.entity';
import { WordAdminController } from './admin/word.admin.controller';
import { WordUserController } from './user/word.user.controller';
import { WordAdminService } from './admin/word.admin.service';
import { WordUserService } from './user/word.user.service';
import { WordAdminRepository } from './admin/word.admin.repo';
import { WordUserRepository } from './user/word.user.repo';

@Module({
  imports: [TypeOrmModule.forFeature([WordEntity])],
  controllers: [WordAdminController, WordUserController],
  providers: [
    WordUserService,
    WordAdminService,
    WordUserRepository,
    WordAdminRepository,
  ],
  exports: [WordAdminService, WordUserService],
})
export class WordModule {}
