import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { ScoreRepository } from './score.repo';
import { ScoreEntity } from './score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreEntity])],
  controllers: [ScoreController],
  providers: [ScoreService, ScoreRepository],
  exports: [ScoreService]
})
export class ScoreModule {}
