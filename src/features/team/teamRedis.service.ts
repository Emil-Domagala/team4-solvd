import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { TeamEntity } from './domains/entities/team.entity';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { TeamMessageEntity } from './domains/entities/teamMessage.entity';

@Injectable()
export class TeamRedisService extends RedisService {
  private readonly TEAM_PREFIX = 'team:';
  private readonly MAX_MESSAGES = 500;

  private key = (teamId: string): string => `${this.TEAM_PREFIX}${teamId}`;

  async saveTeam(team: TeamEntity): Promise<void> {
    await validateOrReject(team);
    await this.getClient().set(this.key(team.id), JSON.stringify(team));
  }

  async getTeam(teamId: string): Promise<TeamEntity | null> {
    const data = await this.getClient().get(this.key(teamId));
    if (!data) return null;

    const raw: unknown = JSON.parse(data);
    const parsed = plainToInstance(TeamEntity, raw);
    await validateOrReject(parsed);
    return parsed;
  }

  async appendMessage(
    teamId: string,
    message: TeamMessageEntity,
  ): Promise<void> {
    const team =
      (await this.getTeam(teamId)) ??
      plainToInstance(TeamEntity, {
        id: teamId,
        name: teamId,
        messages: [],
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    team.messages.push(message);
    if (team.messages.length > this.MAX_MESSAGES) {
      team.messages = team.messages.slice(-this.MAX_MESSAGES);
    }
    team.updatedAt = new Date();

    await this.saveTeam(team);
  }
}
