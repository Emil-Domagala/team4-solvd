import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TeamMessageType,
  TeamMessageEntity,
} from '../../domains/teamMessage.entity';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class TeamMessageDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() teamId: string;
  @Expose() @ApiProperty({ enum: TeamMessageType }) type: TeamMessageType;
  @Expose()
  @ApiPropertyOptional({
    description: 'Author user id. Null for system messages',
    nullable: true,
  })
  authorId: string | null;
  @Expose() @ApiProperty({ maxLength: 2000 }) text: string;
  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;

  static fromEntity(entity: TeamMessageEntity): TeamMessageDto {
    return plainToInstance(TeamMessageDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
