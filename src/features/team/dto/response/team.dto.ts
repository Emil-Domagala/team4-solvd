import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TeamMessageDto } from './teamMessage.dto';

@Exclude()
export class TeamDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() hostId: string;
  @Expose() @ApiProperty({ isArray: true, type: String }) members: string[];
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;

  @Expose()
  @Type(() => TeamMessageDto)
  @ApiProperty({
    type: TeamMessageDto,
    isArray: true,
    description: 'Optional – recent chat preview',
  })
  recentMessages?: TeamMessageDto[];
}
