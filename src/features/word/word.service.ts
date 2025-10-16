import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WordEntity } from './word.entity';
import { WordRepository } from './word.repo';
import { CreateWordDto } from './dto/createWord.dto';
import { UpdateWordDto } from './dto/updateWord.dto';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  count: number;
  limit: number;
  totalPages: number;
  currentPage: number;
  date: Date;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

@Injectable()
export class WordService {
  constructor(private readonly wordRepo: WordRepository) {}

  findAll = async (options?: PaginationOptions): Promise<PaginationResult<WordEntity>> => {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const [words, total] = await this.wordRepo.findAll(page, limit);

    const meta: PaginationMeta = {
      total,
      count: words.length,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      date: new Date(),
    };

    return { data: words, meta };
  }

  findOne = async (id: string): Promise<WordEntity> => {
    const word = await this.wordRepo.findOne(id);
    if (!word) throw new EntityNotFoundError('Word');
    return word;
  }

  create = async (dto: CreateWordDto): Promise<WordEntity> => {
    const newWord = await this.wordRepo.create(dto);
    return this.wordRepo.save(newWord);
  }

  update = async (id: string, dto: UpdateWordDto): Promise<WordEntity> => {
    const word = await this.findOne(id);
    Object.entries(dto).forEach(([key, value]) => {
      if (value != null) (word as any)[key] = value;
    });
    return await this.wordRepo.save(word);
  }

  remove = async (id: string): Promise<WordEntity | null> => {
    const word = await this.wordRepo.findOne(id);
    if (word) await this.wordRepo.delete(id);
    return word;
  }
}
