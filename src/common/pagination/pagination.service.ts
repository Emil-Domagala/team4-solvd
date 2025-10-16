import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SelectQueryBuilder,
  Repository,
  ObjectLiteral,
  FindOptionsOrder,
} from 'typeorm';
import { PaginationResultDto } from './dto/paginationResult.dto';
import { PaginationMetaDto } from './dto/paginationMeta.dto';
import { PaginationQueryDto } from './dto/paginationQuery.dto';

interface SortableDtoClass {
  readonly _allowedSorts?: readonly string[];
}

/**
 * Generic pagination service compatible with both repositories and query builders.
 */
@Injectable()
export class PaginationService {
  /**
   * Paginates any entity using either Repository or QueryBuilder.
   * Handles sorting, paging, and metadata.
   */
  async paginate<
    T extends ObjectLiteral,
    F extends PaginationQueryDto<any> = PaginationQueryDto<any>,
  >(
    source: Repository<T> | SelectQueryBuilder<T>,
    filters: F,
    path = '',
  ): Promise<PaginationResultDto<T, F>> {
    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(Math.max(1, Number(filters.limit ?? 20)), 100);
    const skip = (page - 1) * limit;

    const order: 'ASC' | 'DESC' =
      filters.order && ['ASC', 'DESC'].includes(filters.order)
        ? filters.order
        : 'ASC';

    const sortBy = (filters.sortBy as string) ?? undefined;

    if (this.isQueryBuilder(source)) {
      const dtoCtor = filters.constructor as SortableDtoClass;
      const allowedSorts = dtoCtor._allowedSorts ?? [];

      if (sortBy) {
        if (allowedSorts.length && !allowedSorts.includes(sortBy)) {
          throw new BadRequestException(
            `Invalid sortBy field: '${sortBy}'. Allowed values: ${allowedSorts.join(', ')}`,
          );
        }
        source.orderBy(`${source.alias}.${sortBy}`, order);
      } else {
        source.orderBy(`${source.alias}.createdAt`, 'DESC');
      }
    }

    let data: T[];
    let total: number;

    if (this.isQueryBuilder(source)) {
      [data, total] = await source.skip(skip).take(limit).getManyAndCount();
    } else {
      const orderOption = sortBy
        ? ({ [sortBy]: order } as unknown as FindOptionsOrder<T>)
        : ({ createdAt: 'DESC' } as unknown as FindOptionsOrder<T>);

      [data, total] = await source.findAndCount({
        skip,
        take: limit,
        order: orderOption,
      });
    }

    const meta = new PaginationMetaDto<F>();
    meta.total = total;
    meta.count = data.length;
    meta.perPage = limit;
    meta.totalPages = Math.ceil(total / limit);
    meta.currentPage = page;
    meta.hasNextPage = page < meta.totalPages;
    meta.hasPrevPage = page > 1;
    meta.path = path;
    meta.date = new Date();
    meta.filters = filters;

    return new PaginationResultDto<T, F>(data, meta);
  }

  private isQueryBuilder<T extends ObjectLiteral>(
    source: Repository<T> | SelectQueryBuilder<T>,
  ): source is SelectQueryBuilder<T> {
    return (source as SelectQueryBuilder<T>).getManyAndCount !== undefined;
  }
}
