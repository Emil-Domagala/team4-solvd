import {
  createTestApp,
  stopTestApp,
  clearDatabase,
  app,
} from '../../../../test/app-test';
import { TeamController } from '../team.controller';
import { TeamService } from '../team.service';
import { TeamMessageType } from '../domains/teamMessage.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

describe('TeamController (e2e)', () => {
  let controller: TeamController;
  let service: TeamService;

  beforeAll(async () => {
    await createTestApp();
    controller = app.get(TeamController);
    service = app.get(TeamService);
  }, 120000);

  afterAll(async () => {
    await stopTestApp();
  });

  beforeEach(async () => {
    await clearDatabase?.();
    jest.clearAllMocks();
  });

  describe('GET /team', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          name: 'Avengers',
          hostId: 'user-1',
          members: ['user-1'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(service, 'getAll').mockResolvedValue(mockTeams as any);

      const result = await controller.all();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Avengers');
    });
  });

  describe('POST /team/create', () => {
    it('should create a new team', async () => {
      const req: any = { user: { id: 'user-123' } };
      const dto = { name: 'Guardians', hostId: 'user-123' };

      jest.spyOn(service, 'createTeam').mockResolvedValue({
        id: 'team-1',
        name: 'Guardians',
        hostId: 'user-123',
        members: ['user-123'],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await controller.create(req, dto);
      expect(result.name).toBe('Guardians');
      expect(result.members).toContain('user-123');
    });
  });

  describe('POST /team/join', () => {
    it('should join existing team', async () => {
      jest.spyOn(service, 'join').mockResolvedValue({
        id: 'team-1',
        name: 'Justice League',
        hostId: 'user-1',
        members: ['user-1', 'user-2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const req: any = { user: { id: 'user-2' } };
      const result = await controller.join(req, {
        teamId: 'team-1',
        userId: 'user-2',
      });

      expect(result.members).toContain('user-2');
    });

    it('should throw when team not found', async () => {
      jest
        .spyOn(service, 'join')
        .mockRejectedValue(new EntityNotFoundError('Team'));
      const req: any = { user: { id: 'user-2' } };

      await expect(
        controller.join(req, { teamId: 'invalid', userId: 'user-2' }),
      ).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('POST /team/leave', () => {
    it('should leave a team successfully', async () => {
      jest.spyOn(service, 'leave').mockResolvedValue({
        id: 'team-1',
        name: 'Avengers',
        hostId: 'user-1',
        members: ['user-1'],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const req: any = { user: { id: 'user-2' } };
      const result = await controller.leave(req, {
        teamId: 'team-1',
        userId: 'user-2',
      });
      expect(result).not.toBeNull();

      if (result) {
        expect(result.members).toContain('user-1');
      }
    });

    it('should return null if team was deleted', async () => {
      jest.spyOn(service, 'leave').mockResolvedValue(null);

      const req: any = { user: { id: 'user-2' } };
      const result = await controller.leave(req, {
        teamId: 'team-1',
        userId: 'user-2',
      });

      expect(result).toBeNull();
    });
  });

  describe('POST /team/message', () => {
    it('should send message in team chat', async () => {
      jest.spyOn(service, 'sendMessage').mockResolvedValue({
        id: 'msg-1',
        teamId: 'team-1',
        authorId: 'user-123',
        type: TeamMessageType.USER,
        text: 'Hello team!',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const req: any = { user: { id: 'user-123' } };
      const result = await controller.message(req, {
        teamId: 'team-1',
        authorId: 'user-123',
        text: 'Hello team!',
      });

      expect(result.text).toBe('Hello team!');
      expect(result.type).toBe(TeamMessageType.USER);
    });
  });

  describe('GET /team/:teamId/history', () => {
    it('should return last messages for team', async () => {
      const mockHistory = [
        {
          id: 'msg-1',
          teamId: 'team-1',
          authorId: 'user-123',
          type: TeamMessageType.USER,
          text: 'Hey!',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(service, 'history').mockResolvedValue(mockHistory as any);

      const result = await controller.history('team-1', 10);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Hey!');
    });
  });
});
