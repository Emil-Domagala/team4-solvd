import { Controller, Get, Post } from '@nestjs/common';

@Controller('lobby')
export class LobbyController {
  @Get('rooms')
  async getRooms() {}
  @Post('room')
  async createRoom() {}
  @Post('room/:id/join')
  async joinRoom() {}
  @Post('room/:id/leave')
  async leaveRoom() {}
}
