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
import { TeamService } from './team.service';
import { TeamEvent, TeamEvents } from './domains/team.events';
import { WsAuthGuard } from 'src/common/guards/ws.guard';
import { SendTeamMessageDto } from './dto/sendMessage.dto';

type HandshakeAuth = { userId?: string };

@WebSocketGateway({
  cors: { origin: Env.getString('FRONTEND_DOMAIN') },
})
@UseGuards(WsAuthGuard)
export class TeamGateway extends BaseGateway {
  protected readonly logger = new Logger(TeamGateway.name);

  constructor(
    socketService: SocketService<TeamEvents>,
    private readonly teamService: TeamService,
  ) {
    super(socketService, TeamGateway.name);
  }

  @SubscribeMessage('team:subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { teamId: string },
  ) {
    await client.join(data.teamId);
    this.logger.debug(`Socket ${client.id} subscribed to team ${data.teamId}`);
  }

  @SubscribeMessage(TeamEvent.MESSAGE)
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendTeamMessageDto,
  ) {
    const { teamId, text } = payload;
    const auth = client.handshake.auth as HandshakeAuth;
    const authorId = auth.userId ?? '';

    return this.teamService.sendMessage(teamId, authorId, text);
  }
}
