import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import * as teamEvents from '../team.events';

export class TeamMessageDto {
  @ApiProperty()
  @IsUUID('4')
  teamId: string;

  @ApiProperty()
  @IsEnum(['message', 'system'])
  type: teamEvents.ChatMessageType;

  @ApiProperty({
    description: 'User ID who sent the message (for system can be "system")',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  senderId: string;

  @ApiProperty({ description: 'Sender display name (for system: "System")' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  senderName: string;

  @ApiProperty({ description: 'Message text' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;

  @ApiProperty({ description: 'Epoch ms timestamp' })
  timestamp: number;
}
