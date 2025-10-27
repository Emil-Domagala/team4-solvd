import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { plainToInstance } from 'class-transformer';
import { TeamRedisService } from './team.redis.service';
import { TeamEntity } from './domains/team.entity';
import {
  TeamMessageEntity,
  TeamMessageType,
} from './domains/teamMessage.entity';
import { TeamDto } from './dto/response/team.dto';
import { TeamMessageDto } from './dto/response/teamMessage.dto';
import { SocketService } from 'src/common/socket/socket.service';
import { TeamEvent, TeamEvents } from './domains/team.events';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

@Injectable()
export class TeamService {
  constructor(
    private readonly redis: TeamRedisService,
    private readonly socket: SocketService<TeamEvents>,
  ) {}

  private toTeamDto(team: TeamEntity, recent?: TeamMessageEntity[]): TeamDto {
    const dto = plainToInstance(
      TeamDto,
      {
        ...team.toJSON(),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
      { excludeExtraneousValues: true },
    );

    if (recent) {
      dto.recentMessages = recent.map((m) =>
        plainToInstance(
          TeamMessageDto,
          {
            ...m.toJSON(),
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          },
          { excludeExtraneousValues: true },
        ),
      );
    }
    return dto;
  }

  async createTeam(name: string, hostId: string): Promise<TeamDto> {
    const team = new TeamEntity(name, hostId);
    await this.redis.saveTeam(team);
    const dto = this.toTeamDto(team);
    this.socket.emitToAll(TeamEvent.CREATED, dto);
    return dto;
  }

  async join(teamId: string, userId: string): Promise<TeamDto> {
    const team = await this.redis.getTeam(teamId);
    if (!team) throw new EntityNotFoundError('Team');
    team.addMember(userId);
    await this.redis.saveTeam(team);

    const msg = new TeamMessageEntity({
      id: crypto.randomUUID(),
      teamId,
      authorId: null,
      type: TeamMessageType.SYSTEM,
      text: `User ${userId} joined`,
    });
    await this.redis.pushMessage(msg);

    const dto = this.toTeamDto(team);
    this.socket.emitToRoom(teamId, TeamEvent.JOINED, { teamId, userId });
    this.socket.emitToRoom(teamId, TeamEvent.MESSAGE, {
      teamId,
      message: plainToInstance(TeamMessageDto, msg, {
        excludeExtraneousValues: true,
      }),
    });
    return dto;
  }

  async leave(teamId: string, userId: string): Promise<TeamDto | null> {
    const team = await this.redis.getTeam(teamId);
    if (!team) return null;

    team.removeMember(userId);

    // system message
    const msg = new TeamMessageEntity({
      id: crypto.randomUUID(),
      teamId,
      authorId: null,
      type: TeamMessageType.SYSTEM,
      text: `User ${userId} left`,
    });
    await this.redis.pushMessage(msg);

    if (team.members.length === 0) {
      await this.redis.deleteTeam(teamId);
      this.socket.emitToAll(TeamEvent.DELETED, { teamId });
      return null;
    }

    await this.redis.saveTeam(team);
    const dto = this.toTeamDto(team);
    this.socket.emitToRoom(teamId, TeamEvent.LEFT, { teamId, userId });
    this.socket.emitToRoom(teamId, TeamEvent.MESSAGE, {
      teamId,
      message: plainToInstance(TeamMessageDto, msg, {
        excludeExtraneousValues: true,
      }),
    });
    return dto;
  }

  async sendMessage(
    teamId: string,
    authorId: string,
    text: string,
  ): Promise<TeamMessageDto> {
    const team = await this.redis.getTeam(teamId);
    if (!team) throw new EntityNotFoundError('Team');
    if (!team.members.includes(authorId))
      throw new Error('User is not in this team');

    const msg = new TeamMessageEntity({
      id: crypto.randomUUID(),
      teamId,
      authorId,
      type: TeamMessageType.USER,
      text,
    });
    await this.redis.pushMessage(msg);

    const dto = plainToInstance(TeamMessageDto, msg, {
      excludeExtraneousValues: true,
    });
    this.socket.emitToRoom(teamId, TeamEvent.MESSAGE, { teamId, message: dto });
    return dto;
  }

  async history(teamId: string, limit = 50): Promise<TeamMessageDto[]> {
    const messages = await this.redis.getMessages(teamId, limit);
    return messages.map((m) =>
      plainToInstance(TeamMessageDto, m, { excludeExtraneousValues: true }),
    );
  }

  async getAll(): Promise<TeamDto[]> {
    const teams = await this.redis.listTeams();
    return teams.map((t) => this.toTeamDto(t));
  }
}
