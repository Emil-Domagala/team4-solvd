import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto<
  F extends Record<string, any> = Record<string, any>,
> {
  @ApiProperty({
    example: 100,
    description: 'Total number of items in the database',
  })
  total: number;

  @ApiProperty({
    example: 20,
    description: 'Number of items returned in this page',
  })
  count: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  perPage: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: 2, description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether there is a previous page',
  })
  hasPrevPage: boolean;

  @ApiProperty({
    example: '/api/words',
    description: 'Request path used for pagination',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: 'Filters applied to the pagination request',
    required: false,
    type: Object,
  })
  filters?: F;

  @ApiProperty({
    example: '2025-10-14T12:00:00Z',
    description: 'Date the pagination data was generated',
  })
  date: Date;
}
