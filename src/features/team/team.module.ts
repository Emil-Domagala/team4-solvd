import { Module } from '@nestjs/common';
import { TeamRedisService } from './team.redis.service';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamGateway } from './team.gateway';
import { WsAuthGuard } from 'src/common/guards/ws.guard';

@Module({
  controllers: [TeamController],
  providers: [TeamRedisService, TeamService, TeamGateway, WsAuthGuard],
  exports: [TeamService, TeamRedisService, TeamGateway],
})
export class TeamModule {}
