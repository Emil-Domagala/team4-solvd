import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScoreUserEntity } from './scoreUser.entity';

@Injectable()
export class ScoreUserRepository {
  constructor(
    @InjectRepository(ScoreUserEntity)
    private repo: Repository<ScoreUserEntity>,
  ) {}

  async findByUserId(userId: string) {
    return await this.repo.findOne({ where: { userId } });
  }

  async save(score: ScoreUserEntity) {
    return await this.repo.save(score);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }
}
