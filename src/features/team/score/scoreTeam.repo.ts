import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScoreTeamEntity } from './scoreTeam.entity';

@Injectable()
export class ScoreTeamRepository {
  constructor(
    @InjectRepository(ScoreTeamEntity)
    private repo: Repository<ScoreTeamEntity>,
  ) {}

  async findByTeamId(teamId: string) {
    return await this.repo.findOne({ where: { teamId } });
  }
}
