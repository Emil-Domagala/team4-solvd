import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreUserEntity } from './scoreUser.entity';
import { ScoreUserController } from './scoreUser.controller';
import { ScoreUserService } from './scoreUser.service';
import { ScoreUserRepository } from './scoreUser.repo';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreUserEntity])],
  controllers: [ScoreUserController],
  providers: [ScoreUserService, ScoreUserRepository],
  exports: [ScoreUserService]
})
export class ScoreUserModule {}
