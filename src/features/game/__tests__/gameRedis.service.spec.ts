import { GameRedisService } from '../gameRedis.service';
import { RedisService } from 'src/common/utils/redis.service';
import { GameEntity } from '../domains/game.entity';
import type { Redis } from 'ioredis';

describe('GameRedisService', () => {
  let service: GameRedisService;
  let redisClientMock: jest.Mocked<Partial<Redis>>;
  let redisServiceMock: Partial<RedisService>;

  beforeEach(() => {
    const multiMock = {
      set: jest.fn().mockReturnThis(),
      sadd: jest.fn().mockReturnThis(),
      srem: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([['OK']]),
    };

    redisClientMock = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      sadd: jest.fn(),
      srem: jest.fn(),
      smembers: jest.fn().mockResolvedValue([]),
      multi: jest.fn(() => multiMock as any),
    };

    redisServiceMock = {
      getClient: jest.fn(() => redisClientMock as unknown as Redis),
    };

    service = new GameRedisService(redisServiceMock as RedisService);
    jest.clearAllMocks();
  });

  it('should save game to redis', async () => {
    const game = new GameEntity({
      roomId: 'r1',
      players: ['p1', 'p2'],
      teams: ['t1', 't2'],
      rounds: 2,
      turnDurationInSec: 30,
      wordsPerRound: 3,
    });

    await service.saveGame(game);

    expect(redisClientMock.multi).toHaveBeenCalled();
  });

  it('should get game from redis', async () => {
    const g = new GameEntity({
      roomId: 'r2',
      players: ['p1', 'p2'],
      teams: ['t1', 't2'],
      rounds: 2,
      turnDurationInSec: 30,
      wordsPerRound: 3,
    });

    (redisClientMock.get as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(g.toJSON()),
    );

    const result = await service.getGame(g.id);

    expect(result).not.toBeNull();
    expect(result?.roomId).toBe('r2');
  });

  it('should handle invalid JSON gracefully', async () => {
    (redisClientMock.get as jest.Mock).mockResolvedValueOnce('not-json');

    const result = await service.getGame('invalid-id');

    expect(result).toBeNull();
  });

  it('should delete game from redis', async () => {
    await service.deleteGame('game-123');

    expect(redisClientMock.multi).toHaveBeenCalled();
  });
});
