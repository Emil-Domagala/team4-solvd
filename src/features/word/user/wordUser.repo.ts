import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WordEntity } from '../word.entity';

@Injectable()
export class WordUserRepository {
  constructor(
    @InjectRepository(WordEntity)
    private readonly repo: Repository<WordEntity>
  ) {}

  async getRandomWord(): Promise<WordEntity | null> {
    const count = await this.repo.count();
    if (count === 0) return null;

    const randomOffset = Math.floor(Math.random() * count);
    const [word] = await this.repo.find({
      skip: randomOffset,
      take: 1,
    });
    return word ?? null;
  }

  async getRandomWordExcluding(usedWordIds: string[]): Promise<WordEntity | null> {
    // TODO: Store used words in Redis on a per-game level.
    // This should be refactored so that exclusion is handled based on game state, 
    // not by passing usedWordIds manually.
    
    const qb = this.repo.createQueryBuilder('word');
    if (usedWordIds.length > 0) qb.where('word.id NOT IN (:...usedWordIds)', { usedWordIds });

    const word = await qb.orderBy('RANDOM()').limit(1).getOne();
    return word || null;
  }
}
