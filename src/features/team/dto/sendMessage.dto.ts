import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendTeamMessageDto {
  @ApiProperty() @IsUUID() teamId: string;
  @ApiProperty() @IsUUID() authorId: string;

  @ApiProperty({ minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text: string;
}
