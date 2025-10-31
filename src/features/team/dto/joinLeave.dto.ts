import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class JoinTeamDto {
  @ApiProperty() @IsUUID() teamId: string;
  @ApiProperty() @IsUUID() userId: string;
}

export class LeaveTeamDto {
  @ApiProperty() @IsUUID() teamId: string;
  @ApiProperty() @IsUUID() userId: string;
}
