import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { GameEntity } from './domains/game.entity';

@Injectable()
export class GameRedisService extends RedisService {
  private readonly PREFIX = 'game:';
  private readonly ACTIVE = 'games:active';
  private readonly TTL = 2 * 60 * 60;
  private readonly logger = new Logger(GameRedisService.name);

  private key(id: string) {
    return `${this.PREFIX}${id}`;
  }

  async saveGame(game: GameEntity) {
    await this.getClient()
      .multi()
      .set(this.key(game.id), JSON.stringify(game.toJSON()), 'EX', this.TTL)
      .sadd(this.ACTIVE, game.id)
      .exec();
  }

  async getGame(id: string): Promise<GameEntity | null> {
    const json = await this.getClient().get(this.key(id));
    if (!json) return null;
    try {
      return GameEntity.fromJSON(JSON.parse(json));
    } catch (err) {
      this.logger.error('Invalid game JSON', err);
      return null;
    }
  }

  async deleteGame(id: string) {
    await this.getClient()
      .multi()
      .srem(this.ACTIVE, id)
      .del(this.key(id))
      .exec();
  }

  async getAllGames(): Promise<GameEntity[]> {
    const ids = await this.getClient().smembers(this.ACTIVE);
    const games = await Promise.all(ids.map((i) => this.getGame(i)));
    return games.filter((g): g is GameEntity => !!g);
  }
}
