import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScoreEntity } from '../../score.entity';

@Exclude()
export class ScoreResponseDto {
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
  readonly playerId: string;

  @Expose()
  @ApiProperty()
  readonly createdAt: Date;

  @Expose()
  @ApiProperty()
  readonly updatedAt: Date;

  constructor(partial: Partial<ScoreEntity>) {
    Object.assign(this, partial);
  }
}
