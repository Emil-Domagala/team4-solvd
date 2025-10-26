import {
  IsInt,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScoreTeamEntity } from '../scoreTeam.entity';

export class UpdateScoreTeamDto {
  @IsString()
  readonly teamId: string;

  @IsString()
  readonly roomId: string;

  @ApiProperty({ description: 'Wins', minimum: 0 })
  @IsInt()
  @Min(0)
  wins?: number;

  @ApiProperty({ description: 'Losses', minimum: 0 })
  @IsInt()
  @Min(0)
  losses?: number;

  @ApiProperty({ description: 'Draws', minimum: 0 })
  @IsInt()
  @Min(0)
  draws?: number;

  constructor(partial: Partial<ScoreTeamEntity>) {
    Object.assign(this, partial);
  }
}
