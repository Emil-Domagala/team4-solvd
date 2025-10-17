import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { RoomConfig } from './roomConfig.dto';

export class CreateRoomDto {
  @ApiProperty({ description: 'Room name', minLength: 3, maxLength: 50 })
  @IsString({ message: 'Room name must be a string' })
  @MinLength(3, { message: 'Room name must be at least 3 characters' })
  @MaxLength(50, { message: 'Room name must be at most 50 characters' })
  roomName: string;

  @ApiProperty({ description: 'Room host ID' })
  @IsUUID(4, { message: 'Host ID must be a valid UUID v4' })
  hostId: string;

  @ApiProperty({ type: RoomConfig })
  @ValidateNested()
  @Type(() => RoomConfig)
  roomConfig: RoomConfig;
}
