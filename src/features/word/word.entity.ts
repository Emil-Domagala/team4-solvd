import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum WordCategory {
  GENERAL = 'general',
  SPORTS = 'sports',
  SCIENCE = 'science',
  ENTERTAINMENT = 'entertainment',
  HISTORY = 'history',
}

export enum WordDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('words')
@Unique(['value'])
export class WordEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  value: string;

  @Column({
    type: 'enum',
    enum: WordCategory,
    default: WordCategory.GENERAL
  })
  category: WordCategory;

  @Column({
    type: 'enum',
    enum: WordDifficulty,
    default: WordDifficulty.MEDIUM,
  })
  difficulty: WordDifficulty;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
