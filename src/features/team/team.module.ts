import { Module } from '@nestjs/common';
import { TeamRedisService } from './team.redis.service';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamGateway } from './team.gateway';
import { TeamWsAuthGuard } from './team.ws-auth.guard';

@Module({
  controllers: [TeamController],
  providers: [TeamRedisService, TeamService, TeamGateway, TeamWsAuthGuard],
  exports: [TeamService, TeamRedisService, TeamGateway],
})
export class TeamModule {}
