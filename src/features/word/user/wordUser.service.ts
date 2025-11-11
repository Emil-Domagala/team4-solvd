import { Injectable } from '@nestjs/common';
import { WordUserRepository } from './wordUser.repo';
import { WordEntity } from '../word.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import stringSimilarity from 'string-similarity-js';

@Injectable()
export class WordUserService {
  constructor(private readonly wordUserRepo: WordUserRepository) {}

  async getRandomWord(): Promise<WordEntity> {
    const word = await this.wordUserRepo.getRandomWord();
    if (!word) throw new EntityNotFoundError('Word');
    return word;
  }

  async getRandomWordExcluding(usedWordIds: string[]): Promise<WordEntity> {
    const word = await this.wordUserRepo.getRandomWordExcluding(usedWordIds);
    if (!word) throw new EntityNotFoundError('Word');
    return word;
  }

  getSimilarity(word: string, guess: string): number {
    const similarity = stringSimilarity(word, guess);
    return similarity;
  }
}
