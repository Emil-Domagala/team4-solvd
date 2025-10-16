import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordEntity } from './word.entity';
import { WordService } from './word.service';
import { WordRepository } from './word.repo';
import { WordController } from './word.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WordEntity])],
  controllers: [WordController],
  providers: [WordRepository, WordService],
  exports: [WordRepository, WordService]
})
export class WordModule {}
