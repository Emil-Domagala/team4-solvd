import { Exclude, Expose, Type } from 'class-transformer';
import { RoomConfig } from '../roomConfig.dto';
import type { RoomStatus } from '../../room.entity';

@Exclude()
export class RoomDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  hostId: string;

  @Expose()
  playerIds: string[];

  @Expose()
  teamIds: string[];

  @Expose()
  status: RoomStatus;

  @Expose()
  @Type(() => RoomConfig)
  roomConfig: RoomConfig;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
