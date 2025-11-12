import {
  createTestApp,
  stopTestApp,
  clearDatabase,
  app,
} from 'src/../test/app-test';
import { ScoreTeamService } from 'src/features/team/score/scoreTeam.service';
import { ScoreTeamRedisService } from 'src/features/team/score/scoreTeamRedis.service';
import { SocketService } from 'src/common/socket/socket.service';
import { GameEvent } from 'src/features/game/game.events';
import { UpdateScoreTeamDto } from 'src/features/team/score/dto/updateScoreTeam.dto';
import { ScoreTeamEntity } from 'src/features/team/score/scoreTeam.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

describe('ScoreTeamService (e2e)', () => {
  let service: ScoreTeamService;
  let redis: ScoreTeamRedisService;
  let socketService: SocketService;

  beforeAll(async () => {
    await createTestApp();
    service = app.get(ScoreTeamService);
    redis = app.get(ScoreTeamRedisService);
    socketService = app.get(SocketService);
  }, 60000);

  afterAll(async () => {
    await stopTestApp();
  });

  beforeEach(async () => {
    await clearDatabase?.();
    jest.clearAllMocks();
  });

  it('should update team score and emit socket event', async () => {
    // 1️⃣ Mock Redis z początkowym wynikiem
    const initialScore = new ScoreTeamEntity({
      teamId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      roomId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      wins: 1,
      losses: 0,
      draws: 0,
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.spyOn(redis, 'getTeamScore').mockResolvedValue(initialScore);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.spyOn(redis, 'saveTeamScore').mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    jest.spyOn(socketService, 'emitToRoom').mockImplementation(() => undefined);

    jest.spyOn(socketService, 'emitToRoom').mockImplementation(() => undefined);

    // 2️⃣ Aktualizacja wyniku
    const dto: UpdateScoreTeamDto = {
      teamId: initialScore.teamId,
      roomId: initialScore.roomId,
      wins: 2,
      losses: 1,
      draws: 1,
    };

    const updated = await service.updateTeamScore(dto);

    // 3️⃣ Weryfikacja
    expect(updated).toBeDefined();
    expect(updated.wins).toBe(2);
    expect(updated.losses).toBe(1);
    expect(updated.draws).toBe(1);

    // Redis powinien zapisać nowy wynik
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(redis.saveTeamScore).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(redis.saveTeamScore).toHaveBeenCalledWith(
      dto.roomId,
      expect.any(ScoreTeamEntity),
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(socketService.emitToRoom).toHaveBeenCalledWith(
      dto.roomId,
      GameEvent.SCORE_UPDATED,
      expect.objectContaining({
        teamId: dto.teamId,
        newWins: 2,
        newLosses: 1,
        newDraws: 1,
      }),
    );
  });

  it('should throw if team score not found in redis', async () => {
    jest.spyOn(redis, 'getTeamScore').mockResolvedValue(null);

    const dto: UpdateScoreTeamDto = {
      teamId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      roomId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      wins: 1,
      losses: 0,
      draws: 0,
    };

    await expect(service.updateTeamScore(dto)).rejects.toThrow(
      EntityNotFoundError,
    );
  });
});
