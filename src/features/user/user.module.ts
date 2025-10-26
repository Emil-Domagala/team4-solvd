import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserRepository } from '../user/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleEntity } from './role/role.entity';
import { ScoreUserEntity } from './score/scoreUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, ScoreUserEntity])],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
