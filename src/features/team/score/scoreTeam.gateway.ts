import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from 'src/common/socket/base.gateway';
import { Socket } from 'socket.io';
import { Env } from 'src/common/utils/env.util';
import { ScoreTeamService } from './scoreTeam.service';
import { GameEvent } from 'src/features/game/game.events';
import { SocketService } from 'src/common/socket/socket.service';
import { UpdateScoreTeamDto } from './dto/updateScoreTeam.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';

@WebSocketGateway({
  cors: {
    origin: Env.getString('FRONTEND_DOMAIN'),
  },
})
@UseGuards(AuthGuard)
export class ScoreTeamGateway extends BaseGateway {
  constructor(
    socketService: SocketService,
    private readonly scoreService: ScoreTeamService,
  ) {
    super(socketService, ScoreTeamGateway.name);
  }

  @SubscribeMessage(GameEvent.SCORE_UPDATED)
  async handleScoreUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: UpdateScoreTeamDto,
  ) {
    await this.scoreService.updateTeamScore(dto);
  }
}
