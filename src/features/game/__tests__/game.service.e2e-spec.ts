import {
  createTestApp,
  stopTestApp,
  clearDatabase,
  app,
} from 'src/../test/app-test';
import { GameService } from 'src/features/game/game.service';
import { GameRedisService } from 'src/features/game/gameRedis.service';
import { RoomRedisService } from 'src/features/room/roomRedis.service';
import { SocketService } from 'src/common/socket/socket.service';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import { GameEntity } from 'src/features/game/domains/game.entity';
import { GameEvent } from 'src/features/game/domains/game.events';

describe('GameService (e2e)', () => {
  let service: GameService;
  let redis: GameRedisService;
  let rooms: RoomRedisService;
  let socket: SocketService;

  beforeAll(async () => {
    await createTestApp();
    service = app.get(GameService);
    redis = app.get(GameRedisService);
    rooms = app.get(RoomRedisService);
    socket = app.get(SocketService);
  });

  afterAll(async () => {
    await stopTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  it('should start a game successfully', async () => {
    const mockRoom = {
      getRoomConfig: jest.fn().mockReturnValue({
        rounds: 3,
        turnDurationInSec: 60,
        wordsPerRound: 5,
      }),
      getTeamIds: jest.fn().mockReturnValue(['team1', 'team2']),
      getPlayerIds: jest.fn().mockReturnValue(['p1', 'p2']),
      getStatus: jest.fn().mockReturnValue('waiting'),
    };
    jest.spyOn(rooms, 'getRoom').mockResolvedValue(mockRoom as any);
    const emitSpy = jest
      .spyOn(socket, 'emitToRoom')
      .mockImplementation(() => {});

    const dto = await service.startGame('room-123');
    expect(dto.roomId).toBe('room-123');
    expect(dto.status).toBe('playing');
    expect(emitSpy).toHaveBeenCalledWith(
      'room-123',
      GameEvent.STARTED,
      expect.any(Object),
    );
  });

  it('should throw if room not found', async () => {
    jest.spyOn(rooms, 'getRoom').mockResolvedValue(null);
    await expect(service.startGame('r404')).rejects.toThrow(
      EntityNotFoundError,
    );
  });

  it('should throw if room status is not waiting', async () => {
    const mockRoom = {
      getStatus: jest.fn().mockReturnValue('playing'),
      getTeamIds: jest.fn().mockReturnValue(['t1', 't2']),
      getPlayerIds: jest.fn().mockReturnValue(['p1', 'p2']),
      getRoomConfig: jest.fn().mockReturnValue({
        rounds: 2,
        turnDurationInSec: 30,
        wordsPerRound: 3,
      }),
    };
    jest.spyOn(rooms, 'getRoom').mockResolvedValue(mockRoom as any);
    await expect(service.startGame('r1')).rejects.toThrow(
      'Room is not waiting',
    );
  });

  it('should throw if less than 2 teams', async () => {
    const mockRoom = {
      getStatus: jest.fn().mockReturnValue('waiting'),
      getTeamIds: jest.fn().mockReturnValue(['only-one']),
      getPlayerIds: jest.fn().mockReturnValue(['p1']),
      getRoomConfig: jest.fn().mockReturnValue({
        rounds: 2,
        turnDurationInSec: 30,
        wordsPerRound: 3,
      }),
    };
    jest.spyOn(rooms, 'getRoom').mockResolvedValue(mockRoom as any);
    await expect(service.startGame('r2')).rejects.toThrow(
      'Need at least 2 teams',
    );
  });

  it('should get all games from redis', async () => {
    jest.spyOn(redis, 'getAllGames').mockResolvedValue([
      new GameEntity({
        roomId: 'room-A',
        players: ['p1', 'p2'],
        teams: ['t1', 't2'],
        rounds: 2,
        turnDurationInSec: 30,
        wordsPerRound: 3,
      }),
    ]);
    const result = await service.getAllGames();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].roomId).toBe('room-A');
  });
});
