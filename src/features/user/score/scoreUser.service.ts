import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ScoreUserEntity } from './scoreUser.entity';
import { ScoreUserRepository } from './scoreUser.repo';
import { UpdateScoreUserDto } from './dto/updateScoreUser.dto';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

@Injectable()
export class ScoreUserService {
  constructor(private readonly scoreRepo: ScoreUserRepository) {}

  async getScoreByUserId(userId: string): Promise<ScoreUserEntity> {
    const score = await this.scoreRepo.findByUserId(userId);
    if (!score) throw new EntityNotFoundError('Score');
    return score;
  }

  async updateScoreByUserId(userId: string, dto: UpdateScoreUserDto): Promise<ScoreUserEntity> {
    const score = await this.getScoreByUserId(userId);
    const updated = plainToInstance(ScoreUserEntity, { ...score, ...dto });
    return this.scoreRepo.save(updated);
  }

  async removeScoreByUserId(userId: string): Promise<ScoreUserEntity | null> {
    const score = await this.scoreRepo.findByUserId(userId);
    if (!score) return null;
    await this.scoreRepo.delete(userId);
    return score;
  }
}
