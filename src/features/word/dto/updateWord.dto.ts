import { IsString, IsEnum, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WordCategory, WordDifficulty } from '../word.entity';

export class UpdateWordDto {
  @ApiPropertyOptional({ description: 'Word value', minLength: 2, maxLength: 255 })
  @IsOptional()
  @IsString({ message: 'Value must be a string' })
  @MinLength(2, { message: 'Value must be at least 2 characters' })
  @MaxLength(255, { message: 'Value must be at most 255 characters' })
  value?: string;

  @ApiPropertyOptional({ description: 'Word category' })
  @IsOptional()
  @IsEnum(WordCategory)
  category?: WordCategory;

  @ApiPropertyOptional({ description: 'Word difficulty' })
  @IsOptional()
  @IsEnum(WordDifficulty)
  difficulty?: WordDifficulty;
}
