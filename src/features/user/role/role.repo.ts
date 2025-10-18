import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>
  ) {}

  async findAll(): Promise<RoleEntity[]> {
    return this.repo.find();
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async createDefaultRoles(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    const admin = this.repo.create({ name: 'Admin', priority: 0 });
    const user = this.repo.create({ name: 'User', priority: 10 });
    await this.repo.save([admin, user]);
  }
}
