import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ScoreEntity } from './score.entity';
import { ScoreRepository } from './score.repo';
import { UpdateScoreDto } from './dto/updateScore.dto';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

@Injectable()
export class ScoreService {
  constructor(private readonly scoreRepo: ScoreRepository) {}

  async findOneByUserId(userId: string): Promise<ScoreEntity> {
    const score = await this.scoreRepo.findByUserId(userId);
    if (!score) throw new EntityNotFoundError('Score');
    return score;
  }

  async updateOneByUserId(userId: string, dto: UpdateScoreDto): Promise<ScoreEntity> {
    const score = await this.findOneByUserId(userId);
    const updated = plainToInstance(ScoreEntity, { ...score, ...dto });
    return this.scoreRepo.save(updated);
  }

  async removeOneByUserId(userId: string): Promise<ScoreEntity | null> {
    const score = await this.scoreRepo.findByUserId(userId);
    if (!score) return null;
    await this.scoreRepo.delete(userId);
    return score;
  }
}
