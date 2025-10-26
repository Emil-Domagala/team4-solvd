import { TeamMessageDto } from './teamMessage.dto';

export class TeamChatDto {
  teamId: string;
  messages: TeamMessageDto[];
}
