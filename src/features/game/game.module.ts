import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameRedisService } from './gameRedis.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  providers: [GameGateway, GameService, GameRedisService],
  exports: [GameService, GameRedisService],
})
export class GameModule {}
