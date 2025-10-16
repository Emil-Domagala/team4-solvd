import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/paginationQuery.dto';
import { WordCategory, WordDifficulty } from '../word.entity';

/**
 * Defines valid sort fields for words.
 */
export type WordSortKeys =
  | 'value'
  | 'category'
  | 'difficulty'
  | 'createdAt'
  | 'updatedAt';

export class WordFilterDto extends PaginationQueryDto<WordSortKeys> {
  static readonly _allowedSorts: readonly WordSortKeys[] = [
    'value',
    'category',
    'difficulty',
    'createdAt',
    'updatedAt',
  ];

  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: WordCategory,
  })
  @IsOptional()
  @IsEnum(WordCategory)
  category?: WordCategory;

  @ApiPropertyOptional({
    description: 'Filter by difficulty',
    enum: WordDifficulty,
  })
  @IsOptional()
  @IsEnum(WordDifficulty)
  difficulty?: WordDifficulty;

  @ApiPropertyOptional({
    description: 'Search by partial word value',
    example: 'art',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}
