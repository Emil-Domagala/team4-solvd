import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WordEntity, WordCategory, WordDifficulty } from '../../word.entity';

@Exclude()
export class WordResponseDto {
  @Expose()
  @ApiProperty()
  readonly id: string;

  @Expose()
  @ApiProperty()
  readonly value: string;

  @Expose()
  @ApiProperty({ enum: WordCategory })
  readonly category: WordCategory;

  @Expose()
  @ApiProperty({ enum: WordDifficulty })
  readonly difficulty: WordDifficulty;

  @Expose()
  @ApiProperty()
  readonly createdAt: Date;

  @Expose()
  @ApiProperty()
  readonly updatedAt: Date;

  constructor(partial: Partial<WordEntity>) {
    Object.assign(this, partial);
  }
}
