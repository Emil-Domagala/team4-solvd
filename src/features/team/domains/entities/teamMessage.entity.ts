import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsDate,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

export enum TeamMessageType {
  MESSAGE = 'message',
  SYSTEM = 'system',
}

export class TeamMessageEntity {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  teamId: string;

  @IsEnum(TeamMessageType)
  type: TeamMessageType;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  senderId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  senderName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}
