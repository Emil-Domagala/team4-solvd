import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { TeamEntity } from './domains/team.entity';
import { TeamMessageEntity } from './domains/teamMessage.entity';

@Injectable()
export class TeamRedisService {
  private readonly logger = new Logger('TeamRedisService');

  constructor(private readonly redis: RedisService) {}

  private teamKey(id: string) {
    return `team:${id}`;
  }

  private activeTeamsKey = 'teams:active';

  private messagesKey(id: string) {
    return `team:${id}:messages`;
  }

  private ttl = 2 * 60 * 60;

  async saveTeam(team: TeamEntity) {
    const client = this.redis.getClient();
    await client.set(
      this.teamKey(team.id),
      JSON.stringify(team.toJSON()),
      'EX',
      this.ttl,
    );
    await client.sadd(this.activeTeamsKey, team.id);
    await client.expire(this.activeTeamsKey, this.ttl);
  }

  async getTeam(id: string): Promise<TeamEntity | null> {
    const json = await this.redis.getClient().get(this.teamKey(id));
    if (!json) return null;
    try {
      return TeamEntity.fromJSON(JSON.parse(json));
    } catch (err) {
      this.logger.warn(`Failed to parse team ${id}`, err);
      return null;
    }
  }

  async deleteTeam(id: string) {
    const client = this.redis.getClient();
    await client.srem(this.activeTeamsKey, id);
    await client.del(this.teamKey(id), this.messagesKey(id));
  }

  async listTeams(): Promise<TeamEntity[]> {
    const ids = await this.redis.getClient().smembers(this.activeTeamsKey);
    if (!ids.length) return [];
    const teams = await Promise.all(ids.map((id) => this.getTeam(id)));
    return teams.filter((t): t is TeamEntity => Boolean(t));
  }

  async pushMessage(msg: TeamMessageEntity) {
    const key = this.messagesKey(msg.teamId);
    const data = JSON.stringify(msg.toJSON());
    const client = this.redis.getClient();
    await client.rpush(key, data);
    await client.expire(key, this.ttl);
  }

  async getMessages(teamId: string, limit = 50): Promise<TeamMessageEntity[]> {
    const key = this.messagesKey(teamId);
    const raw = await this.redis.getClient().lrange(key, -limit, -1);

    return raw
      .map((jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr) as Record<string, any>;
          return TeamMessageEntity.fromJSON(parsed);
        } catch (err) {
          this.logger.warn(`Invalid JSON in messages for team ${teamId}`, err);
          return null;
        }
      })
      .filter((msg): msg is TeamMessageEntity => msg !== null);
  }
}
