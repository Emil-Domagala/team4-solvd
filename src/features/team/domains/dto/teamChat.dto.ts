import { ApiProperty } from '@nestjs/swagger';
import { TeamMessageDto } from './teamMessage.dto';

export class TeamChatDto {
  @ApiProperty({ example: 'team-uuid', description: 'Team unique identifier' })
  teamId: string;

  @ApiProperty({
    description: 'List of chat messages',
    type: [TeamMessageDto],
    example: [
      {
        id: 'msg-uuid-1',
        teamId: 'team-uuid',
        type: 'message',
        senderId: 'user-uuid-1',
        senderName: 'John Doe',
        text: 'Hello team!',
        createdAt: '2025-01-01T12:00:00.000Z',
        updatedAt: '2025-01-01T12:00:00.000Z',
      },
    ],
  })
  messages: TeamMessageDto[];
}
