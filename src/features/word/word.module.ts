import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordEntity } from './word.entity';
import { WordAdminController } from './admin/wordAdmin.controller';
import { WordUserController } from './user/wordUser.controller';
import { WordAdminService } from './admin/wordAdmin.service';
import { WordUserService } from './user/wordUser.service';
import { WordAdminRepository } from './admin/wordAdmin.repo';
import { WordUserRepository } from './user/wordUser.repo';

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
