import { UserEntity } from 'src/features/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('score')
export class ScoreUserEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'int', default: 0 })
  wins: number;

  @Column({ type: 'int', default: 0 })
  losses: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @OneToOne(() => UserEntity, (user) => user.score)
  readonly user: UserEntity;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
