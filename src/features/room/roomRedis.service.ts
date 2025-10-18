import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { RoomEntity } from './room.entity';

@Injectable()
export class RoomRedisService extends RedisService {
  private readonly ROOM_PREFIX = 'room:';
  private readonly ACTIVE_ROOMS_KEY = 'rooms:active';
  private readonly DEFAULT_ROOM_TTL = 2 * 60 * 60;
  private readonly logger = new Logger(RoomRedisService.name);

  private getRoomKey(id: string) {
    return `${this.ROOM_PREFIX}${id}`;
  }

  async saveRoom(room: RoomEntity, ttl = this.DEFAULT_ROOM_TTL) {
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
      this.logger.debug('Error parsing room JSON', e);
      return null;
    }
  }

  async deleteRoom(roomId: string) {
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
}
