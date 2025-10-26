import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/utils/redis.service';
import { TeamMessageDto } from './domains/dto/teamMessage.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  private readonly CHAT_PREFIX = 'team:chat:';
  private readonly MAX_MESSAGES = 500;

  constructor(private readonly redis: RedisService) {}

  private key(teamId: string) {
    return `${this.CHAT_PREFIX}${teamId}`;
  }

  /** Dodaj wiadomość do Redis (rpush) i przytnij listę do MAX_MESSAGES */
  async appendMessage(msg: TeamMessageDto): Promise<void> {
    const client = this.redis.getClient();
    const payload = JSON.stringify(msg);
    await client
      .multi()
      .rpush(this.key(msg.teamId), payload)
      .ltrim(this.key(msg.teamId), Math.max(0, -this.MAX_MESSAGES), -1) // przycinamy do ostatnich MAX
      .exec();
  }

  /** Pobierz ostatnie N wiadomości (domyślnie 50) */
  async getHistory(teamId: string, last = 50): Promise<TeamMessageDto[]> {
    const client = this.redis.getClient();
    // zakres od -last do -1 to ostatnie `last` elementów
    const raw = await client.lrange(this.key(teamId), -last, -1);
    const parsed = raw
      .map((x) => {
        try {
          return JSON.parse(x) as TeamMessageDto;
        } catch {
          return null;
        }
      })
      .filter((x): x is TeamMessageDto => !!x);
    return parsed;
  }

  /** Wiadomość systemowa: wejście/wyjście */
  async systemMessage(teamId: string, text: string): Promise<TeamMessageDto> {
    const msg: TeamMessageDto = {
      teamId,
      type: 'system',
      senderId: 'system',
      senderName: 'System',
      text,
      timestamp: Date.now(),
    };
    await this.appendMessage(msg);
    return msg;
  }
}
