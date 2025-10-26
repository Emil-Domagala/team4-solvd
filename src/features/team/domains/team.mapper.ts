import { plainToInstance } from 'class-transformer';
import { TeamMessageEntity } from './entities/teamMessage.entity';
import { TeamMessageDto } from './dto/teamMessage.dto';

export class TeamMapper {
  static toMessageDto(this: void, entity: TeamMessageEntity): TeamMessageDto {
    return plainToInstance(TeamMessageDto, entity, {
      enableImplicitConversion: true,
    });
  }

  static toMessageEntity(this: void, dto: TeamMessageDto): TeamMessageEntity {
    return plainToInstance(TeamMessageEntity, dto, {
      enableImplicitConversion: true,
    });
  }
}
