import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RoomService } from './room.service';
import { RoomEvent } from './domains/room.events';
import { CreateRoomDto } from './domains/createRoom.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Env } from 'src/common/utils/env.util';
import { BaseGateway } from 'src/common/socket/base.gateway';
import { SocketService } from 'src/common/socket/socket.service';

@WebSocketGateway({
  cors: {
    origin: Env.getString('FRONTEND_DOMAIN'),
  },
})
@UseGuards(AuthGuard)
export class RoomGateway extends BaseGateway {
  constructor(
    socketService: SocketService,
    private readonly roomService: RoomService,
  ) {
    super(socketService, RoomGateway.name);
  }

  // ------------------ ROOM CREATION ------------------
  @SubscribeMessage(RoomEvent.CREATED)
  async createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateRoomDto,
  ) {
    try {
      const room = await this.roomService.createRoom(
        dto.hostId,
        dto.roomName,
        dto.roomConfig,
      );

      await client.join(room.id);

      this.logger.log(`Room created: ${room.id}`);
    } catch (error) {
      this.socketService.emitToClient(
        client.id,
        RoomEvent.ERROR,
        (error as Error).message,
      );
    }
  }

  // ------------------ JOIN ROOM ------------------
  @SubscribeMessage(RoomEvent.JOINED)
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    try {
      await this.roomService.joinToRoom(data.roomId, data.playerId);

      await client.join(data.roomId);

      this.logger.log(`Player ${data.playerId} joined room ${data.roomId}`);
    } catch (error) {
      this.socketService.emitToClient(
        client.id,
        RoomEvent.ERROR,
        (error as Error).message,
      );
    }
  }

  // ------------------ LEAVE ROOM ------------------
  @SubscribeMessage(RoomEvent.LEFT)
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    try {
      const room = await this.roomService.leaveRoom(data.roomId, data.playerId);
      if (!room) return;

      await client.leave(data.roomId);

      this.logger.log(`Player ${data.playerId} left room ${data.roomId}`);
    } catch (error) {
      this.socketService.emitToClient(
        client.id,
        RoomEvent.ERROR,
        (error as Error).message,
      );
    }
  }
}
