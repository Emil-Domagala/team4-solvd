import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEnum } from './role.enum';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RoleEnum, unique: true })
  name: RoleEnum;

  @Column({ type: 'int', default: 10 })
  priority: number;
}
