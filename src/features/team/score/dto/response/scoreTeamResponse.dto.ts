import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScoreTeamEntity } from '../../scoreTeam.entity';

@Exclude()
export class ScoreTeamResponseDto {
  @Expose()
  @ApiProperty()
  readonly id: string;

  @Expose()
  @ApiProperty()
  readonly wins: number;

  @Expose()
  @ApiProperty()
  readonly losses: number;

  @Expose()
  @ApiProperty()
  readonly draws: number;

  @Expose()
  @ApiProperty()
  readonly teamId: string;

  @Expose()
  @ApiProperty()
  readonly roomId: string;

  @Expose()
  @ApiProperty()
  readonly createdAt: Date;

  @Expose()
  @ApiProperty()
  readonly updatedAt: Date;

  constructor(partial: Partial<ScoreTeamEntity>) {
    Object.assign(this, partial);
  }
}
