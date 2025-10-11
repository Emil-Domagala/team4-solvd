import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repo';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { EmailIsAlreadyTakenError } from './error/emailAlreadyTaken.error';
import { PasswordService } from 'src/common/utils/password.service';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  register = async (dto: CreateUserDto) => {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new EmailIsAlreadyTakenError();

    return this.userRepository.createUser(dto);
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
