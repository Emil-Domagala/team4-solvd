import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class StartGameDto {
  @ApiProperty({ description: 'Room ID where game should start' })
  @IsUUID()
  roomId: string;
}
