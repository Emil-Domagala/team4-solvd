import {
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

export abstract class BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  protected server: Server;

  protected readonly logger: Logger;

  constructor(
    protected readonly socketService: SocketService,
    context: string,
  ) {
    this.logger = new Logger(context);
  }

  afterInit() {
    this.socketService.setServer(this.server);
    this.logger.log('Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.socketService.addClient(client);
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.socketService.removeClient(client);
    this.logger.debug(`Client disconnected: ${client.id}`);
  }
}
