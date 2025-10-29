import { Injectable } from '@nestjs/common';
import { SocketService } from 'src/common/socket/socket.service';
import { ScoreTeamRepository } from './scoreTeam.repo';
import { RoomEvents } from 'src/features/room/domains/room.events';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import { GameEvent } from 'src/features/game/game.events';
import { UpdateScoreTeamDto } from './dto/updateScoreTeam.dto';
import { ScoreTeamEntity } from './scoreTeam.entity';
import { ScoreTeamRedisService } from './scoreTeamRedis.service';

@Injectable()
export class ScoreTeamService {
  constructor(
    private readonly redis: ScoreTeamRedisService,
    private readonly socketService: SocketService<RoomEvents>,
    private readonly scoreRepo: ScoreTeamRepository,
  ) {}

  async getScoreByTeamId(teamId: string) {
    const score = await this.scoreRepo.findByTeamId(teamId);
    if (!score) throw new EntityNotFoundError('Score');
    return score;
  }

  async updateTeamScore(dto: UpdateScoreTeamDto): Promise<ScoreTeamEntity> {
    const score = await this.redis.getTeamScore(dto.roomId, dto.teamId);
    if (!score) throw new EntityNotFoundError('Score');

    // Update score and save
    const entity = new ScoreTeamEntity(dto);
    entity.setScore(dto);
    await this.redis.saveTeamScore(dto.roomId, entity);

    // Broadcast
    this.socketService.emitToRoom(dto.roomId, GameEvent.SCORE_UPDATED, {
      teamId: dto.teamId,
      newWins: dto.wins,
      newLosses: dto.losses,
      newDraws: dto.draws,
    });

    return entity;
  }
}
