import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Env } from 'src/common/utils/env.util';
import { BaseGateway } from 'src/common/socket/base.gateway';
import { SocketService } from 'src/common/socket/socket.service';
import { TeamService } from './team.service';
import { TeamEvent } from './domains/team.events';
import { TeamMessageDto } from './domains/dto/teamMessage.dto';

type JoinPayload = { teamId: string; userId: string; userName: string };
type MessagePayload = {
  teamId: string;
  senderId: string;
  senderName: string;
  text: string;
};

@WebSocketGateway({
  cors: {
    origin: Env.getString('FRONTEND_DOMAIN'),
  },
})
export class TeamGateway extends BaseGateway {
  protected readonly logger = new Logger(TeamGateway.name);

  private clientTeam = new Map<
    string,
    { teamId: string; userId: string; userName: string }
  >();

  constructor(
    socketService: SocketService,
    private readonly teamService: TeamService,
  ) {
    super(socketService, TeamGateway.name);
  }

  private roomName(teamId: string) {
    return `team:${teamId}`;
  }

  @SubscribeMessage(TeamEvent.JOIN)
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    try {
      const { teamId, userId, userName } = payload;
      if (!teamId || !userId || !userName)
        throw new Error('Invalid join payload');

      await client.join(this.roomName(teamId));
      this.clientTeam.set(client.id, { teamId, userId, userName });

      const history = await this.teamService.getHistory(teamId, 50);
      this.socketService.emitToClient(client.id, TeamEvent.HISTORY, {
        teamId,
        messages: history,
      });

      const sys = await this.teamService.systemMessage(
        teamId,
        `${userName} joined the chat`,
      );
      this.socketService.emitToRoom(
        this.roomName(teamId),
        TeamEvent.BROADCAST,
        sys,
      );
    } catch (e) {
      this.socketService.emitToClient(
        client.id,
        TeamEvent.ERROR,
        (e as Error).message,
      );
    }
  }

  @SubscribeMessage(TeamEvent.LEAVE)
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() { teamId, userName }: JoinPayload,
  ) {
    try {
      await client.leave(this.roomName(teamId));
      this.clientTeam.delete(client.id);

      const sys = await this.teamService.systemMessage(
        teamId,
        `${userName} left the chat`,
      );
      this.socketService.emitToRoom(
        this.roomName(teamId),
        TeamEvent.BROADCAST,
        sys,
      );
    } catch (e) {
      this.socketService.emitToClient(
        client.id,
        TeamEvent.ERROR,
        (e as Error).message,
      );
    }
  }

  @SubscribeMessage(TeamEvent.MESSAGE)
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    try {
      const { teamId, senderId, senderName, text } = payload;
      if (!teamId || !senderId || !senderName || !text?.trim())
        throw new Error('Invalid message payload');

      const msg: TeamMessageDto = {
        teamId,
        type: 'message',
        senderId,
        senderName,
        text: text.trim(),
        timestamp: Date.now(),
      };

      await this.teamService.appendMessage(msg);

      this.socketService.emitToRoom(
        this.roomName(teamId),
        TeamEvent.BROADCAST,
        msg,
      );
    } catch (e) {
      this.socketService.emitToClient(
        client.id,
        TeamEvent.ERROR,
        (e as Error).message,
      );
    }
  }

  override handleDisconnect(client: Socket) {
    const ctx = this.clientTeam.get(client.id);
    if (ctx) {
      const { teamId, userName } = ctx;
      this.teamService
        .systemMessage(teamId, `${userName} disconnected`)
        .then((sys) =>
          this.socketService.emitToRoom(
            this.roomName(teamId),
            TeamEvent.BROADCAST,
            sys,
          ),
        )
        .catch(() => void 0);
      this.clientTeam.delete(client.id);
    }
    super.handleDisconnect(client);
  }
}
