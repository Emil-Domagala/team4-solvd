import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Env } from 'src/common/utils/env.util';
import { BaseGateway } from 'src/common/socket/base.gateway';
import { SocketService } from 'src/common/socket/socket.service';
import { GameService } from './game.service';
import { GameEvent } from './domains/game.events';
import { StartGameDto } from './domains/dto/startGame.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@WebSocketGateway({ cors: { origin: Env.getString('FRONTEND_DOMAIN') } })
@UseGuards(AuthGuard)
export class GameGateway extends BaseGateway {
  protected readonly logger = new Logger(GameGateway.name);

  constructor(
    socket: SocketService,
    private readonly service: GameService,
  ) {
    super(socket, GameGateway.name);
  }

  @SubscribeMessage(GameEvent.STARTED)
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: StartGameDto,
  ) {
    const game = await this.service.startGame(dto.roomId);
    await client.join(game.roomId);
    this.logger.log(`Client ${client.id} started game in room ${game.roomId}`);
  }
}
