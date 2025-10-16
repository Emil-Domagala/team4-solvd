import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './paginationMeta.dto';
import { plainToInstance } from 'class-transformer';

export class PaginationResultDto<
  T,
  F extends Record<string, any> = Record<string, any>,
> {
  @ApiProperty({ description: 'Paginated data list', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: PaginationMetaDto<F>;

  constructor(
    data: unknown[],
    meta: PaginationMetaDto<F>,
    transform?: ((item: any) => T) | (new (...args: any[]) => T),
  ) {
    if (transform) {
      if (typeof transform === 'function' && transform.prototype) {
        this.data = plainToInstance(
          transform as new (...args: any[]) => T,
          data,
        );
      } else {
        this.data = (data as any[]).map(transform as (item: any) => T);
      }
    } else {
      this.data = data as T[];
    }

    this.meta = meta;
  }
}
