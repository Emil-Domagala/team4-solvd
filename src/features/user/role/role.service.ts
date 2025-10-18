import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repo';
import { RoleEntity } from './role.entity';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async findAll(): Promise<RoleEntity[]> {
    return this.roleRepo.findAll();
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.roleRepo.findByName(name);
  }

  async ensureDefaults(): Promise<void> {
    await this.roleRepo.createDefaultRoles();
  }
}
