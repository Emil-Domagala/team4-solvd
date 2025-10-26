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
    if (room.getPlayerIds().length === room.getRoomConfig().maxPlayers) {
      room.lockRoom();
    }
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

    if (room.getStatus() === 'locked') {
      room.unlockRoom();
    }

    if (room.getPlayerIds().length === 0) {
      await this.deleteRoomInternal(room);
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

  /** Delete room */
  async deleteRoom(roomId: string, playerId: string): Promise<void> {
    const room = await this.redis.getRoom(roomId);
    if (!room) throw new EntityNotFoundError(`Room`);
    if (room.getHostId() !== playerId)
      throw new Error('Only the host can delete this room');
    if (room.getStatus() !== 'waiting')
      throw new Error('TODO: Room is not waiting');
    await this.deleteRoomInternal(room);
  }

  /* Helper method to delete room. IT DO NOT REQUIRE AUTH */
  private async deleteRoomInternal(roomEntity: RoomEntity): Promise<void> {
    await this.redis.deleteRoom(roomEntity.getId());
    const dto = this.toDto(roomEntity);
    this.socketService.emitToAll(RoomEvent.DELETED, { room: dto });
    this.logger.log(`Room ${roomEntity.getId()} deleted`);
  }

  /** Start the room (game/session/etc.) */
  async startRoom(room: RoomEntity): Promise<RoomDto> {
    room.startGame();
    await this.redis.saveRoom(room);
    const dto = this.toDto(room);
    this.socketService.emitToRoom(room.getId(), RoomEvent.STARTED, dto);
    return dto;
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
}
