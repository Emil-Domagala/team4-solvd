import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScoreEntity } from './score.entity';

@Injectable()
export class ScoreRepository {
  constructor(
    @InjectRepository(ScoreEntity)
    private repo: Repository<ScoreEntity>,
  ) {}

  async findByUserId(userId: string) {
    return await this.repo.findOne({ where: { userId } });
  }

  async save(score: ScoreEntity) {
    return await this.repo.save(score);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }
}