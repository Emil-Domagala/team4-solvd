/* eslint-disable @typescript-eslint/no-unsafe-assignment, 
   @typescript-eslint/no-unsafe-call, 
   @typescript-eslint/no-unsafe-member-access */

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { TeamService } from './team.service';
import { TeamEvent } from './domains/team.events';

export interface JoinPayload {
  teamId: string;
  userId: string;
  userName: string;
}

export interface MessagePayload {
  teamId: string;
  senderId: string;
  senderName: string;
  text: string;
}

@WebSocketGateway()
export class TeamGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TeamGateway.name);

  constructor(private readonly teamService: TeamService) {}

  private roomName(teamId: string): string {
    return `team:${teamId}`;
  }

  private async smallDelay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  @SubscribeMessage(TeamEvent.JOIN)
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    await client.join(this.roomName(payload.teamId));
    await this.smallDelay(50);

    this.logger.debug(
      `Client ${client.id} joined team ${payload.teamId} rooms: ${[
        ...client.rooms,
      ].join(', ')}`,
    );

    await this.teamService.onClientJoined(client.id, payload);

    this.server.to(this.roomName(payload.teamId)).emit(TeamEvent.BROADCAST, {
      type: 'system',
      text: `${payload.userName} joined the chat.`,
      teamId: payload.teamId,
    });
  }

  @SubscribeMessage(TeamEvent.MESSAGE)
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MessagePayload,
  ) {
    this.logger.debug(`[MSG] ${payload.senderName}: ${payload.text}`);
    await this.teamService.onMessage(client.id, payload);

    this.server.to(this.roomName(payload.teamId)).emit(TeamEvent.BROADCAST, {
      type: 'message',
      text: payload.text,
      senderName: payload.senderName,
      teamId: payload.teamId,
    });
  }

  @SubscribeMessage(TeamEvent.LEAVE)
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { teamId: string; userName: string },
  ) {
    await client.leave(this.roomName(payload.teamId));
    this.logger.debug(`Client ${client.id} left team ${payload.teamId}`);
    await this.teamService.onClientLeft(client.id, payload);

    this.server.to(this.roomName(payload.teamId)).emit(TeamEvent.BROADCAST, {
      type: 'system',
      text: `${payload.userName} left the chat.`,
      teamId: payload.teamId,
    });
  }
}
