import {
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScoreDto {
  @IsUUID()
  readonly playerId: string;

  @ApiProperty({ description: 'Wins', minimum: 0 })
  @IsInt()
  @Min(0)
  readonly wins: number;

  @ApiProperty({ description: 'Losses', minimum: 0 })
  @IsInt()
  @Min(0)
  readonly losses: number;

  @ApiProperty({ description: 'Draws', minimum: 0 })
  @IsInt()
  @Min(0)
  readonly draws: number;
}
