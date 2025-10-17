import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { RoomRedisService } from './roomRedis.service';
import { RoomService } from './room.service';

@Module({
  controllers: [RoomController],
  providers: [RoomGateway, RoomRedisService, RoomService],
  exports: [RoomGateway, RoomRedisService, RoomService],
})
export class RoomModule {}
