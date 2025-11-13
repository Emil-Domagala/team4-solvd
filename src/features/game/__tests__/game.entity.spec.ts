import { GameEntity } from '../domains/game.entity';

describe('GameEntity', () => {
  let game: GameEntity;

  beforeEach(() => {
    game = new GameEntity({
      roomId: 'r1',
      players: ['p1', 'p2'],
      teams: ['t1', 't2'],
      rounds: 3,
      turnDurationInSec: 60,
      wordsPerRound: 5,
    });
  });

  it('should start the game correctly', () => {
    game.start('t1', 'p1');
    expect(game.status).toBe('playing');
    expect(game.currentRound).toBe(1);
  });

  it('should add score correctly', () => {
    game.addScore('t1', 10);
    expect(game.scores['t1']).toBe(10);
  });

  it('should advance rounds and end game after last', () => {
    game.start('t1', 'p1');
    game.nextRound();
    game.nextRound();
    game.nextRound();
    expect(game.status).toBe('ended');
  });

  it('should serialize and deserialize correctly', () => {
    const json = game.toJSON();
    const from = GameEntity.fromJSON(json);
    expect(from.roomId).toBe('r1');
    expect(from.rounds).toBe(3);
  });
});
