import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { PasswordService } from 'src/common/utils/password.service';
import { CreateUserDto } from './dto/createUser.dto';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
    private passwordService: PasswordService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const user = this.repo.create(dto);
    user.password = await this.passwordService.toHash(user.password);
    return this.repo.save(user);
  }

  async updatePassword(userId: string, newPassword: string) {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user) throw new EntityNotFoundError('User');
    user.password = await this.passwordService.toHash(newPassword);
    return this.repo.save(user);
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ email });
  }
  async findById(id: string): Promise<UserEntity | null> {
    return await this.repo.findOneBy({ id });
  }
}
