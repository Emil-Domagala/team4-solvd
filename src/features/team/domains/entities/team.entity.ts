import { Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { TeamMessageEntity } from './teamMessage.entity';

export class TeamEntity {
  @IsUUID('4')
  id: string;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMessageEntity)
  messages: TeamMessageEntity[] = [];

  @IsArray()
  @IsString({ each: true })
  members: string[] = [];

  @Type(() => Date)
  @IsDate()
  createdAt: Date = new Date();

  @Type(() => Date)
  @IsDate()
  updatedAt: Date = new Date();
}
