// features/team/team.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TeamRedisService } from './teamRedis.service';
import {
  TeamMessageEntity,
  TeamMessageType,
} from './domains/entities/teamMessage.entity';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { JoinPayload, MessagePayload } from './team.gateway';
import { TeamMapper } from './domains/team.mapper';
import { TeamMessageDto } from './domains/dto/teamMessage.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private readonly redis: TeamRedisService) {}

  async onClientJoined(socketId: string, payload: JoinPayload): Promise<void> {
    const { teamId, userId, userName } = payload;

    const message = plainToInstance(TeamMessageEntity, {
      id: uuidv4(),
      teamId,
      type: TeamMessageType.SYSTEM,
      senderId: userId,
      senderName: userName,
      text: `${userName} joined the team.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validateOrReject(message);
    await this.redis.appendMessage(teamId, message);
    this.logger.debug(`[JOIN] ${userName} (${socketId}) joined ${teamId}`);
  }

  async onMessage(socketId: string, payload: MessagePayload): Promise<void> {
    const { teamId, senderId, senderName, text } = payload;

    const message = plainToInstance(TeamMessageEntity, {
      id: uuidv4(),
      teamId,
      type: TeamMessageType.MESSAGE,
      senderId,
      senderName,
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validateOrReject(message);
    await this.redis.appendMessage(teamId, message);

    this.logger.debug(`[MSG] ${senderName}: ${text}`);
  }

  async onClientLeft(
    socketId: string,
    payload: { teamId: string; userId?: string; userName?: string },
  ): Promise<void> {
    const { teamId, userId = 'unknown', userName = 'unknown' } = payload;

    const message = plainToInstance(TeamMessageEntity, {
      id: uuidv4(),
      teamId,
      type: TeamMessageType.SYSTEM,
      senderId: userId,
      senderName: userName,
      text: `${userName} left the team.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validateOrReject(message);
    await this.redis.appendMessage(teamId, message);

    this.logger.debug(`[LEAVE] ${userName} (${socketId}) left ${teamId}`);
  }

  async getHistory(teamId: string): Promise<TeamMessageDto[]> {
    const team = await this.redis.getTeam(teamId);
    if (!team) return [];
    const last50 = team.messages.slice(-50);
    return last50.map(TeamMapper.toMessageDto);
  }
}
