import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { ScoreTeamEntity } from './scoreTeam.entity';

@Injectable()
export class ScoreTeamRedisService extends RedisService {
  private readonly SCORE_PREFIX = 'score-team:';
  private readonly DEFAULT_TTL = 2 * 60 * 60;

  private getKey(roomId: string, teamId: string): string {
    return `${this.SCORE_PREFIX}${roomId}:${teamId}`;
  }

  async saveTeamScore(
    roomId: string,
    score: ScoreTeamEntity,
    ttl = this.DEFAULT_TTL,
  ): Promise<void> {
    const key = this.getKey(roomId, score.getTeamId());
    const client = this.getClient();

    await client.set(key, JSON.stringify(score.toJSON()), 'EX', ttl);
  }

  async getTeamScore(
    roomId: string,
    teamId: string,
  ): Promise<ScoreTeamEntity | null> {
    const key = this.getKey(roomId, teamId);
    const json = await this.getClient().get(key);
    if (!json) return null;

    try {
      const data = JSON.parse(json);
      return ScoreTeamEntity.fromJSON(data);
    } catch (error) {
      return null;
    }
  }
}
