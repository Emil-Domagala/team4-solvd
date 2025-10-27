import { TeamDto } from '../dto/response/team.dto';
import { TeamMessageDto } from '../dto/response/teamMessage.dto';

export enum TeamEvent {
  CREATED = 'team:created',
  UPDATED = 'team:updated',
  DELETED = 'team:deleted',
  JOINED = 'team:joined',
  LEFT = 'team:left',
  MESSAGE = 'team:message',
  ERROR = 'team:error',
}

export interface TeamEvents {
  [TeamEvent.CREATED]: (team: TeamDto) => void;
  [TeamEvent.UPDATED]: (team: TeamDto) => void;
  [TeamEvent.DELETED]: (payload: { teamId: string }) => void;
  [TeamEvent.JOINED]: (payload: { teamId: string; userId: string }) => void;
  [TeamEvent.LEFT]: (payload: { teamId: string; userId: string }) => void;
  [TeamEvent.MESSAGE]: (payload: {
    teamId: string;
    message: TeamMessageDto;
  }) => void;
  [TeamEvent.ERROR]: (message: string) => void;
  [key: string]: (...args: any[]) => void;
}
