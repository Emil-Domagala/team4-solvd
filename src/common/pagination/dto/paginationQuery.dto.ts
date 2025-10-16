import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsEnum, IsString, Max, Min } from 'class-validator';

/**
 * Generic base DTO for pagination + sorting.
 *
 * Extend this class in filter DTOs (e.g. `WordFilterDto`)
 * and specify which fields are allowed for sorting via:
 *
 * ```ts
 * static _allowedSorts = ['createdAt', 'value'] as const;
 * ```
 */
export abstract class PaginationQueryDto<TSortKeys extends string = string> {
  /** Defines which sort fields are allowed for this DTO */
  static readonly _allowedSorts: readonly string[] = [];

  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be at most 100' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  sortBy?: TSortKeys;

  @ApiPropertyOptional({
    description: 'Sort order (ASC or DESC)',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'Order must be ASC or DESC' })
  order: 'ASC' | 'DESC' = 'ASC';
}
