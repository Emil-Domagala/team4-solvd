import {
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScoreDto {
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
}
