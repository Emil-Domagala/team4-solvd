import { Module } from '@nestjs/common';
import { TeamGateway } from './team.gateway';
import { TeamService } from './team.service';
import { TeamRedisService } from './teamRedis.service';
import { TeamController } from './team.controller';
import { SocketModule } from 'src/common/socket/socket.module';

@Module({
  imports: [SocketModule],
  controllers: [TeamController],
  providers: [TeamGateway, TeamService, TeamRedisService],
  exports: [TeamService],
})
export class TeamModule {}
