import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { Env } from '../utils/env.util';

@WebSocketGateway({
  cors: {
    origin: Env.getString('FRONTEND_DOMAIN'),
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}

  handleConnection(client: Socket) {
    this.socketService.addClient(client);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.socketService.removeClient(client);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`${client.id} joined room ${data.room}`);
    this.server.to(data.room).emit('system', {
      text: `${client.id} joined room ${data.room}`,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`${client.id} left room ${data.room}`);
    this.server.to(data.room).emit('system', {
      text: `${client.id} left room ${data.room}`,
    });
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room?: string; text?: string },
  ) {
    if (!data?.room || !data?.text) {
      this.logger.warn(`Invalid message from ${client.id}:`, data);
      return;
    }

    // tylko jeśli klient rzeczywiście jest w tym pokoju
    if (!client.rooms.has(data.room)) {
      this.logger.warn(
        `Client ${client.id} tried to send message to room ${data.room} without joining it.`,
      );
      return;
    }

    this.logger.log(`Message from ${client.id} to ${data.room}: ${data.text}`);
    this.server.to(data.room).emit('message', {
      from: client.id,
      text: data.text,
      room: data.room,
    });
  }
}
