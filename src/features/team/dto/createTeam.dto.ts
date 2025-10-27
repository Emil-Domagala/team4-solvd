import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Team host (creator) userId' })
  @IsUUID()
  hostId: string;
}
