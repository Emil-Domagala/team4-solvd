import { Injectable, Logger } from '@nestjs/common';
import { GameRedisService } from './gameRedis.service';
import { RoomRedisService } from '../room/roomRedis.service';
import { SocketService } from 'src/common/socket/socket.service';
import { GameEvent, GameEvents } from './domains/game.events';
import { GameEntity } from './domains/game.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import { plainToInstance } from 'class-transformer';
import { GameDto } from './domains/dto/game.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly redis: GameRedisService,
    private readonly rooms: RoomRedisService,
    private readonly socket: SocketService<GameEvents>,
  ) {}

  private toDto(game: GameEntity): GameDto {
    return plainToInstance(GameDto, game, { excludeExtraneousValues: true });
  }

  async startGame(roomId: string): Promise<GameDto> {
    const room = await this.rooms.getRoom(roomId);
    if (!room) throw new EntityNotFoundError('Room');
    if (room.getStatus() !== 'waiting') throw new Error('Room is not waiting');

    const teams = room.getTeamIds();
    if (teams.length < 2) throw new Error('Need at least 2 teams');

    const config = room.getRoomConfig();
    const game = new GameEntity({
      roomId,
      teams,
      config,
    });

    const players = room.getPlayerIds();
    if (players.length === 0) throw new Error('No players found in the room');

    const firstTeamId = teams[0];
    const firstPlayerId = players[0];

    game.start(firstTeamId, firstPlayerId);

    await this.redis.saveGame(game);
    const dto = this.toDto(game);

    this.socket.emitToRoom(roomId, GameEvent.STARTED, dto);
    this.logger.log(`Game ${game.id} started for room ${roomId}`);

    return dto;
  }

  async getAllGames(): Promise<GameDto[]> {
    const all = await this.redis.getAllGames();
    return all.map((g) => this.toDto(g));
  }
}
