import { Injectable, Logger } from '@nestjs/common';
import { RoomConfig } from './domains/roomConfig.dto';
import { RoomEntity } from './room.entity';
import { RoomRedisService } from './roomRedis.service';
import { SocketService } from 'src/common/socket/socket.service';
import { RoomEvent, RoomEvents } from './domains/room.events';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import { plainToInstance } from 'class-transformer';
import { RoomDto } from './domains/dto/room.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly redis: RoomRedisService,
    private readonly socketService: SocketService<RoomEvents>,
  ) {}

  private toDto(room: RoomEntity): RoomDto {
    return plainToInstance(RoomDto, room, { excludeExtraneousValues: true });
  }

  /** Create new room and notify clients */
  async createRoom(
    hostId: string,
    roomName: string,
    roomConfig: RoomConfig,
  ): Promise<RoomDto> {
    const room = new RoomEntity(roomName, hostId, roomConfig);
    await this.redis.saveRoom(room);
    const dto = this.toDto(room);
    this.socketService.emitToAll(RoomEvent.CREATED, dto);
    this.logger.log(`Room created: ${room.getId()}`);
    return dto;
  }

  /** Player joins to room */
  async joinToRoom(roomId: string, playerId: string): Promise<RoomDto> {
    const room = await this.redis.getRoom(roomId);
    if (!room) throw new EntityNotFoundError(`Room`);
    if (room.getStatus() !== 'waiting')
      throw new Error('TODO: Room is not waiting');

    room.addPlayer(playerId);
    await this.redis.saveRoom(room);
    const dto = this.toDto(room);
    this.socketService.emitToRoom(roomId, RoomEvent.JOINED, {
      room: dto,
      playerId,
    });
    this.logger.log(`Player ${playerId} joined room ${roomId}`);
    return dto;
  }

  /** Player leaves room */
  async leaveRoom(roomId: string, playerId: string): Promise<RoomDto | null> {
    const room = await this.redis.getRoom(roomId);
    if (!room) return null;
    room.removePlayer(playerId);

    if (room.getPlayerIds().length === 0) {
      await this.redis.deleteRoom(roomId);
      const dto = this.toDto(room);
      this.socketService.emitToAll(RoomEvent.DELETED, { room: dto, playerId });
      this.logger.log(`Room ${roomId} deleted`);
      return null;
    }

    await this.redis.saveRoom(room);
    const dto = this.toDto(room);
    this.socketService.emitToRoom(roomId, RoomEvent.LEFT, {
      room: dto,
      playerId,
    });

    return dto;
  }

  /** Start the room (game/session/etc.) */
  async startRoom(room: RoomEntity): Promise<RoomDto> {
    room.startGame();
    await this.redis.saveRoom(room);
    const dto = this.toDto(room);
    this.socketService.emitToRoom(room.getId(), RoomEvent.STARTED, dto);
    return dto;
  }

  /** End the room */
  async endRoom(room: RoomEntity): Promise<void> {
    if (!room) return;
    room.endGame();
    await this.redis.deleteRoom(room.getId());
    const dto = this.toDto(room);
    this.socketService.emitToRoom(room.getId(), RoomEvent.ENDED, { room: dto });
  }

  /** Returns all active rooms */
  async getRooms(): Promise<RoomDto[]> {
    const all = await this.redis.getAllRooms();
    return all.map((r) => this.toDto(r));
  }

  /** Returns joinable rooms */
  async getAvailableRooms(): Promise<RoomDto[]> {
    const all = await this.redis.getAllRooms();
    const dtos: RoomDto[] = [];
    for (const room of all) {
      if (room.getStatus() === 'waiting') {
        dtos.push(this.toDto(room));
      }
    }
    return dtos;
  }

  async joinTeam(roomId: string, teamId: string, playerId: string) {
    const room = await this.redis.getRoom(roomId);
    if (!room) throw new EntityNotFoundError('Room');

    if (!room.getPlayerIds().includes(playerId)) {
      throw new Error('Player must join the room first');
    }

    if (!room.getTeamIds().includes(teamId)) {
      room.addTeam(teamId);
    }

    await this.redis.saveRoom(room);
    const dto = this.toDto(room);

    await this.redis.saveSystemMessage(
      roomId,
      teamId,
      `Player ${playerId} joined the team.`,
    );

    this.socketService.emitToRoom(`${roomId}:${teamId}`, 'team:message', {
      playerId: 'system',
      username: 'SYSTEM',
      text: `Player ${playerId} joined the team.`,
      timestamp: new Date().toISOString(),
    });

    this.socketService.emitToRoom(roomId, 'team:joined', {
      room: dto,
      teamId,
      playerId,
    });
    this.logger.log(
      `Player ${playerId} joined team ${teamId} in room ${roomId}`,
    );
    return dto;
  }

  async leaveTeam(roomId: string, teamId: string, playerId: string) {
    const room = await this.redis.getRoom(roomId);
    if (!room) throw new EntityNotFoundError('Room');

    await this.redis.saveSystemMessage(
      roomId,
      teamId,
      `Player ${playerId} left the team.`,
    );

    this.socketService.emitToRoom(`${roomId}:${teamId}`, 'team:message', {
      playerId: 'system',
      username: 'SYSTEM',
      text: `Player ${playerId} left the team.`,
      timestamp: new Date().toISOString(),
    });

    this.socketService.emitToRoom(roomId, 'team:left', {
      roomId,
      teamId,
      playerId,
    });

    this.logger.log(`Player ${playerId} left team ${teamId} in room ${roomId}`);
  }

  async sendTeamMessage(
    roomId: string,
    teamId: string,
    message: { playerId: string; username: string; text: string },
  ) {
    const room = await this.redis.getRoom(roomId);
    if (!room) throw new EntityNotFoundError('Room');

    const chatMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    await this.redis.saveTeamMessage(roomId, teamId, chatMessage);
    this.socketService.emitToRoom(
      `${roomId}:${teamId}`,
      'team:message',
      chatMessage,
    );

    this.logger.debug(
      `Message in team ${teamId} (${roomId}) from ${message.username}: ${message.text}`,
    );

    return chatMessage;
  }

  async getTeamChat(roomId: string, teamId: string) {
    return this.redis.getTeamMessages(roomId, teamId);
  }
}
