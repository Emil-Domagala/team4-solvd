import { RoomDto } from './domains/dto/room.dto';

export enum TeamEvent {
  JOINED = 'team:joined',
  MESSAGE = 'team:message',
  HISTORY = 'team:history',
  ERROR = 'team:error',
}

export interface TeamEvents {
  [TeamEvent.JOINED]: (payload: {
    room: RoomDto;
    teamId: string;
    playerId: string;
  }) => void;
  [TeamEvent.MESSAGE]: (payload: {
    playerId: string;
    username: string;
    text: string;
    timestamp: string;
  }) => void;
  [TeamEvent.HISTORY]: (messages: any[]) => void;
  [TeamEvent.ERROR]: (message: string) => void;
}
