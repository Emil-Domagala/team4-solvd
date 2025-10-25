import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { RoomEntity } from './room.entity';

export interface TeamChatMessage {
  playerId: string;
  username: string;
  text: string;
  timestamp: string;
}

@Injectable()
export class RoomRedisService extends RedisService {
  private readonly ROOM_PREFIX = 'room:';
  private readonly ACTIVE_ROOMS_KEY = 'rooms:active';
  private readonly DEFAULT_ROOM_TTL = 2 * 60 * 60; // 2 godziny
  private readonly CHAT_TTL = 2 * 60 * 60; // TTL czatu
  private readonly logger = new Logger(RoomRedisService.name);

  private getRoomKey(id: string) {
    return `${this.ROOM_PREFIX}${id}`;
  }

  // ------------------ ROOM HANDLING ------------------

  async saveRoom(room: RoomEntity, ttl = this.DEFAULT_ROOM_TTL): Promise<void> {
    const key = this.getRoomKey(room.getId());
    const activeKey = this.ACTIVE_ROOMS_KEY;

    await this.getClient()
      .multi()
      .set(key, JSON.stringify(room.toJSON()), 'EX', ttl)
      .sadd(activeKey, room.getId())
      .expire(activeKey, ttl)
      .exec();
  }

  async getRoom(roomId: string): Promise<RoomEntity | null> {
    const json = await this.getClient().get(this.getRoomKey(roomId));
    if (!json) return null;

    try {
      const parsed = JSON.parse(json) as Record<string, any>;
      return RoomEntity.fromJSON(parsed);
    } catch (e) {
      this.logger.warn(`Error parsing room JSON for room ${roomId}`, e);
      return null;
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.getClient()
      .multi()
      .srem(this.ACTIVE_ROOMS_KEY, roomId)
      .del(this.getRoomKey(roomId))
      .exec();
  }

  async getAllRooms(): Promise<RoomEntity[]> {
    const roomIds = await this.getClient().smembers(this.ACTIVE_ROOMS_KEY);
    if (!roomIds.length) return [];

    const rooms = await Promise.all(roomIds.map((id) => this.getRoom(id)));
    return rooms.filter((r): r is RoomEntity => r !== null);
  }

  // ------------------ TEAM CHAT HANDLING ------------------

  private getTeamChatKey(roomId: string, teamId: string): string {
    return `room:${roomId}:team:${teamId}:chat`;
  }

  async saveTeamMessage(
    roomId: string,
    teamId: string,
    message: TeamChatMessage,
  ): Promise<void> {
    const key = this.getTeamChatKey(roomId, teamId);

    await this.getClient()
      .multi()
      .lpush(key, JSON.stringify(message))
      .ltrim(key, 0, 49) // trzyma max 50 ostatnich wiadomości
      .expire(key, this.CHAT_TTL)
      .exec();
  }

  async getTeamMessages<T = TeamChatMessage>(
    roomId: string,
    teamId: string,
  ): Promise<T[]> {
    const key = this.getTeamChatKey(roomId, teamId);
    const messages = await this.getClient().lrange(key, 0, -1);
    return messages.map((msg) => JSON.parse(msg) as T);
  }

  async saveSystemMessage(
    roomId: string,
    teamId: string,
    text: string,
  ): Promise<void> {
    const message: TeamChatMessage = {
      playerId: 'system',
      username: 'SYSTEM',
      text,
      timestamp: new Date().toISOString(),
    };

    await this.saveTeamMessage(roomId, teamId, message);
  }
}
