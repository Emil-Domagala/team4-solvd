export enum GameEvent {
  STARTED = 'game:started',
  ENDED = 'game:ended',
  PAUSED = 'game:paused',
  RESUMED = 'game:resumed',
  ROUND_STARTED = 'game:round-started',
  ROUND_ENDED = 'game:round-ended',
  TURN_STARTED = 'game:turn-started',
  TURN_ENDED = 'game:turn-ended',
  WORD_GUESSED = 'game:word-guessed',
  WORD_SKIPPED = 'game:word-skipped',
  SCORE_UPDATED = 'game:score-updated',
}

export interface GameStartData {
  gameId: string;
  roomId: string;
  players: string[];
  teams: string[];
  config: {
    rounds: number;
    turnDurationInSec: number;
    wordsPerRound: number;
  };
}

export interface RoundData {
  gameId: string;
  roundNumber: number;
  currentTeam: string;
}

export interface TurnData {
  gameId: string;
  roundNumber: number;
  currentPlayer: string;
  currentTeam: string;
  timeLeft: number;
}

export interface WordData {
  gameId: string;
  word: string;
  points: number;
  teamId: string;
}

export interface ScoreData {
  gameId: string;
  scores: Record<string, number>; // teamId -> score
}

export interface GameEvents {
  [GameEvent.STARTED]: (data: GameStartData) => void;
  [GameEvent.ENDED]: (data: {
    gameId: string;
    finalScores: Record<string, number>;
  }) => void;
  [GameEvent.PAUSED]: (gameId: string) => void;
  [GameEvent.RESUMED]: (gameId: string) => void;
  [GameEvent.ROUND_STARTED]: (data: RoundData) => void;
  [GameEvent.ROUND_ENDED]: (data: RoundData) => void;
  [GameEvent.TURN_STARTED]: (data: TurnData) => void;
  [GameEvent.TURN_ENDED]: (data: TurnData) => void;
  [GameEvent.WORD_GUESSED]: (data: WordData) => void;
  [GameEvent.WORD_SKIPPED]: (data: WordData) => void;
  [GameEvent.SCORE_UPDATED]: (data: ScoreData) => void;
}
