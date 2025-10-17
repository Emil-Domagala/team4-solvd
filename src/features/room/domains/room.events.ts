import { RoomDto } from './dto/room.dto';

export enum RoomEvent {
  CREATED = 'room:created',
  JOINED = 'room:joined',
  LEFT = 'room:left',
  ERROR = 'room:error',
  UPDATED = 'room:updated',
  DELETED = 'room:deleted',
  STARTED = 'room:started',
  ENDED = 'room:ended',
}

export interface RoomEvents {
  [RoomEvent.CREATED]: (room: RoomDto) => void;
  [RoomEvent.JOINED]: (payload: { room: RoomDto; playerId: string }) => void;
  [RoomEvent.LEFT]: (payload: { room: RoomDto; playerId: string }) => void;
  [RoomEvent.STARTED]: (room: RoomDto) => void;
  [RoomEvent.ENDED]: (payload: { room: RoomDto }) => void;
  [RoomEvent.DELETED]: (payload: { room: RoomDto; playerId: string }) => void;
  [RoomEvent.ERROR]: (message: string) => void;

  [key: string]: (...args: any[]) => void;
}
