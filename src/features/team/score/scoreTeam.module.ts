import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreTeamEntity } from './scoreTeam.entity';
import { ScoreTeamController } from './scoreTeam.controller';
import { ScoreTeamService } from './scoreTeam.service';
import { ScoreTeamRepository } from './scoreTeam.repo';
import { ScoreTeamRedisService } from './scoreTeamRedis.service';
import { SocketModule } from 'src/common/socket/socket.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreTeamEntity]), SocketModule],
  controllers: [ScoreTeamController],
  providers: [ScoreTeamService, ScoreTeamRepository, ScoreTeamRedisService],
  exports: [ScoreTeamService, ScoreTeamRedisService],
})
export class ScoreTeamModule {}
