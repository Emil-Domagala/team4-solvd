import { Controller, Get } from '@nestjs/common';
import { RoomDto } from './domains/dto/room.dto';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRooms(): Promise<RoomDto[]> {
    return this.roomService.getAvailableRooms();
  }
}
