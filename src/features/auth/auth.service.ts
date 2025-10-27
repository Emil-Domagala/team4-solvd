import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repo';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { EmailIsAlreadyTakenError } from './error/emailAlreadyTaken.error';
import { PasswordService } from 'src/common/utils/password.service';
import { UserEntity } from '../user/user.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';
import { RoleService } from '../user/role/role.service';
import { RoleEnum } from '../user/role/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  register = async (dto: CreateUserDto): Promise<UserEntity> => {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new EmailIsAlreadyTakenError();
    const role = await this.roleService.findByName(RoleEnum.USER);
    if (!role) throw new EntityNotFoundError('Role');

    return this.userRepository.createUser(dto, role);
  };

  validateUser = async (
    email: string,
    password: string,
  ): Promise<UserEntity | null> => {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await this.passwordService.compare(password, user.password);
    if (!isValid) return null;

    return user;
  };
}
