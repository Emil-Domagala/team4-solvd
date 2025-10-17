import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { Env } from '../utils/env.util';

@WebSocketGateway({
  cors: {
    origin: Env.getString('FRONTEND_DOMAIN'),
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}

  afterInit() {
    this.socketService.setServer(this.server);
  }

  handleConnection(client: Socket) {
    this.socketService.addClient(client);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.socketService.removeClient(client);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { text: string },
  ) {
    console.log(`Received message from ${client.id}:`, payload);
    this.server.emit('message', { from: client.id, text: payload.text });
  }
}
