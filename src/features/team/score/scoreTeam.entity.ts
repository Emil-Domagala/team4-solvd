import { plainToInstance } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UpdateScoreTeamDto } from './dto/updateScoreTeam.dto';

export class ScoreTeamEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'int', default: 0 })
  private wins: number;

  @Column({ type: 'int', default: 0 })
  private losses: number;

  @Column({ type: 'int', default: 0 })
  private draws: number;

  @Column({ type: 'uuid' })
  readonly teamId: string;

  @Column({ type: 'uuid' })
  readonly roomId: string;
  
  @CreateDateColumn()
  private readonly createdAt: Date;

  @UpdateDateColumn()
  private readonly updatedAt: Date;

  constructor(partial: Partial<ScoreTeamEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  getTeamId(): string {
    return this.teamId;
  }

  setScore(dto: UpdateScoreTeamDto): void {
    if (dto.wins) this.wins = dto.wins;
    if (dto.losses) this.losses = dto.losses;
    if (dto.draws) this.draws = dto.draws;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      teamId: this.teamId,
      roomId: this.roomId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: Record<string, any>): ScoreTeamEntity {
    const instance = plainToInstance(ScoreTeamEntity, {
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });

    return instance;
  }
}
