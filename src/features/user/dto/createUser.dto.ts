import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', minLength: 2, maxLength: 255 })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @ApiProperty({ description: 'User email', maxLength: 255 })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255, { message: 'Email must be at most 255 characters' })
  email: string;

  @ApiProperty({ description: 'Password', minLength: 8, maxLength: 255 })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(255, { message: 'Password must be at most 255 characters' })
  password: string;
}
