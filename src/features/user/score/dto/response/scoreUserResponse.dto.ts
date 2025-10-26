import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScoreUserEntity } from '../../scoreUser.entity';

@Exclude()
export class ScoreUserResponseDto {
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
  readonly userId: string;

  @Expose()
  @ApiProperty()
  readonly createdAt: Date;

  @Expose()
  @ApiProperty()
  readonly updatedAt: Date;

  constructor(partial: Partial<ScoreUserEntity>) {
    Object.assign(this, partial);
  }
}
