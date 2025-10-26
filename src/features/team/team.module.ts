import { Module } from '@nestjs/common';
import { TeamGateway } from './team.gateway';
import { TeamService } from './team.service';

@Module({
  providers: [TeamGateway, TeamService],
  exports: [TeamService],
})
export class TeamModule {}
