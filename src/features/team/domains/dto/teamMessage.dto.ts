import { ApiProperty } from '@nestjs/swagger';
import { TeamMessageType } from '../entities/teamMessage.entity';

export class TeamMessageDto {
  @ApiProperty({ example: 'msg-uuid' })
  id: string;

  @ApiProperty({ example: 'team-uuid' })
  teamId: string;

  @ApiProperty({ enum: TeamMessageType, example: TeamMessageType.MESSAGE })
  type: TeamMessageType;

  @ApiProperty({ example: 'user-uuid' })
  senderId: string;

  @ApiProperty({ example: 'Alice' })
  senderName: string;

  @ApiProperty({ example: 'Hello everyone!' })
  text: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: Date;
}
