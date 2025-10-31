export enum GameEvent {
  STARTED = 'game:started',
  ENDED = 'game:ended',
  ROUND_STARTED = 'game:round-started',
  ROUND_ENDED = 'game:round-ended',
  TURN_STARTED = 'game:turn-started',
  TURN_ENDED = 'game:turn-ended',
  WORD_GUESSED = 'game:word-guessed',
  WORD_SKIPPED = 'game:word-skipped',
  SCORE_UPDATED = 'game:score-updated',
}

export interface GameEvents {
  [GameEvent.STARTED]: (data: any) => void;
  [GameEvent.ENDED]: (data: any) => void;
  [GameEvent.ROUND_STARTED]: (data: any) => void;
  [GameEvent.ROUND_ENDED]: (data: any) => void;
  [GameEvent.TURN_STARTED]: (data: any) => void;
  [GameEvent.TURN_ENDED]: (data: any) => void;
  [GameEvent.WORD_GUESSED]: (data: any) => void;
  [GameEvent.WORD_SKIPPED]: (data: any) => void;
  [GameEvent.SCORE_UPDATED]: (data: any) => void;
  [key: string]: (...args: any[]) => void;
}
