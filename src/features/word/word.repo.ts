import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WordEntity } from './word.entity';
import { CreateWordDto } from './dto/createWord.dto';

@Injectable()
export class WordRepository {
  constructor(
    @InjectRepository(WordEntity)
    private readonly repo: Repository<WordEntity>,
  ) {}

  getQueryBuilder() {
    return this.repo.createQueryBuilder('word');
  }

  async findAll(page = 1, limit = 20) {
    return await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string) {
    return await this.repo.findOne({ where: { id } });
  }

  create(dto: CreateWordDto) {
    return this.repo.create(dto);
  }

  async save(word: WordEntity) {
    return await this.repo.save(word);
  }

  async delete(id: string) {
    return await this.repo.delete(id);
  }
}
