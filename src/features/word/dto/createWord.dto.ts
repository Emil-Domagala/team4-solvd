import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WordCategory, WordDifficulty } from '../word.entity';

export class CreateWordDto {
  @ApiProperty({ description: 'Word value', minLength: 2, maxLength: 255 })
  @IsString({ message: 'Value must be a string' })
  @MinLength(2, { message: 'Value must be at least 2 characters' })
  @MaxLength(255, { message: 'Value must be at most 255 characters' })
  value: string;

  @ApiProperty({ description: 'Word category' })
  @IsEnum(WordCategory)
  category: WordCategory;

  @ApiProperty({ description: 'Word difficulty' })
  @IsEnum(WordDifficulty)
  difficulty: WordDifficulty;
}
