import { Injectable } from '@nestjs/common';
import { WordEntity } from '../word.entity';
import { CreateWordDto } from '../dto/createWord.dto';
import { UpdateWordDto } from '../dto/updateWord.dto';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import { PaginationResultDto } from 'src/common/pagination/dto/paginationResult.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { plainToInstance } from 'class-transformer';
import { WordFilterDto } from '../dto/wordFilter.dto';
import { WordAdminRepository } from './word.admin.repo';

@Injectable()
export class WordAdminService {
  constructor(
    private readonly wordRepo: WordAdminRepository,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllByFilters(
    filters: WordFilterDto,
  ): Promise<PaginationResultDto<WordEntity, WordFilterDto>> {
    const query = this.wordRepo.getQueryBuilder();

    // Filtering
    if (filters.category) {
      query.andWhere('word.category = :category', {
        category: filters.category,
      });
    }

    if (filters.difficulty) {
      query.andWhere('word.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters.search) {
      query.andWhere('word.value ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    return this.paginationService.paginate(query, filters, '/words');
  }

  async findOneById(id: string): Promise<WordEntity> {
    const word = await this.wordRepo.findById(id);
    if (!word) throw new EntityNotFoundError('Word');
    return word;
  }

  async create(dto: CreateWordDto): Promise<WordEntity> {
    const newWord = this.wordRepo.create(dto);
    return this.wordRepo.save(newWord);
  }

  async update(id: string, dto: UpdateWordDto): Promise<WordEntity> {
    const word = await this.findOneById(id);
    const updated = plainToInstance(WordEntity, { ...word, ...dto });
    return this.wordRepo.save(updated);
  }

  async remove(id: string): Promise<WordEntity | null> {
    const word = await this.wordRepo.findById(id);
    if (!word) return null;
    await this.wordRepo.delete(id);
    return word;
  }
}
