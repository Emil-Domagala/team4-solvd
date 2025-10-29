import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreTeamEntity } from './scoreTeam.entity';
import { ScoreTeamController } from './scoreTeam.controller';
import { ScoreTeamService } from './scoreTeam.service';
import { ScoreTeamRepository } from './scoreTeam.repo';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreTeamEntity])],
  controllers: [ScoreTeamController],
  providers: [ScoreTeamService, ScoreTeamRepository],
  exports: [ScoreTeamService]
})
export class ScoreTeamModule {}
