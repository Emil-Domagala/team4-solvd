export enum TeamEvent {
  JOIN = 'team:join',
  LEAVE = 'team:leave',
  MESSAGE = 'team:message',
  HISTORY = 'team:history',
  BROADCAST = 'team:broadcast',
  ERROR = 'team:error',
}

export type ChatMessageType = 'message' | 'system';
