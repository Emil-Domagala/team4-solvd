import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repo';
import { UserEntity } from './user.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  me = async (userId: string): Promise<UserEntity> => {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError('User');
    return user;
  };
}
