import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, MinLength } from 'class-validator';

export class SkipWordDto {
  @ApiProperty() @IsUUID() gameId: string;
  @ApiProperty() @IsUUID() teamId: string;
  @ApiProperty() @IsUUID() playerId: string;
  @ApiProperty() @IsString() @MinLength(1) wordId: string;
}
