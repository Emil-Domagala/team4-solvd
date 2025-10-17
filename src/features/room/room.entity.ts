import * as crypto from 'node:crypto';
import { plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomConfig } from './domains/roomConfig.dto';

export type RoomStatus = 'waiting' | 'playing' | 'ended';

export class RoomEntity {
  @IsUUID()
  readonly id: string;

  @IsUUID()
  readonly hostId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ValidateNested()
  @Type(() => RoomConfig)
  readonly roomConfig: RoomConfig;

  @IsArray()
  @IsUUID('4', { each: true })
  playerIds: string[] = [];

  @IsArray()
  @IsUUID('4', { each: true })
  teamIds: string[] = [];

  @IsEnum(['waiting', 'playing', 'ended'])
  status: RoomStatus = 'waiting';

  @IsDate()
  readonly createdAt: Date;

  @IsDate()
  updatedAt: Date;

  constructor(name: string, hostId: string, roomConfig: RoomConfig) {
    this.id = crypto.randomUUID();
    this.name = name.trim();
    this.hostId = hostId;
    this.playerIds = [hostId];
    this.roomConfig = roomConfig;
    this.createdAt = new Date();
    this.updatedAt = new Date();

    this.validate();
  }

  // --- Getters ---
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getHostId(): string {
    return this.hostId;
  }

  getPlayerIds(): readonly string[] {
    return this.playerIds;
  }

  getTeamIds(): readonly string[] {
    return this.teamIds;
  }

  getStatus(): RoomStatus {
    return this.status;
  }

  getRoomConfig(): RoomConfig {
    return this.roomConfig;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // --- Domain logic ---
  renameRoom(newName: string): void {
    if (!newName?.trim()) throw new Error('Room name cannot be empty');
    this.name = newName.trim();
    this.touch();
  }

  addPlayer(playerId: string): void {
    if (this.playerIds.includes(playerId)) {
      throw new Error(`Player ${playerId} already in room`);
    }

    if (this.playerIds.length >= this.roomConfig.maxPlayers) {
      throw new Error('Room is full');
    }

    this.playerIds.push(playerId);
    this.touch();
  }

  removePlayer(playerId: string): void {
    const before = this.playerIds.length;
    this.playerIds = this.playerIds.filter((id) => id !== playerId);
    if (before !== this.playerIds.length) this.touch();
  }

  addTeam(teamId: string): void {
    if (this.teamIds.includes(teamId)) {
      throw new Error(`Team ${teamId} already exists`);
    }
    this.teamIds.push(teamId);
    this.touch();
  }

  removeTeam(teamId: string): void {
    const before = this.teamIds.length;
    this.teamIds = this.teamIds.filter((id) => id !== teamId);
    if (before !== this.teamIds.length) this.touch();
  }

  startGame(): void {
    if (this.status !== 'waiting') {
      throw new Error(`Cannot start game when status is ${this.status}`);
    }
    if (this.playerIds.length < this.roomConfig.minPlayers) {
      throw new Error('Not enough players to start the game');
    }
    this.status = 'playing';
    this.touch();
  }

  endGame(): void {
    if (this.status !== 'playing') {
      throw new Error(`Cannot end game when status is ${this.status}`);
    }
    this.status = 'ended';
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private validate(): void {
    const errors = validateSync(this, { whitelist: true });
    if (errors.length > 0) {
      const message = errors
        .map((err) => Object.values(err.constraints ?? {}).join(', '))
        .join('; ');
      throw new Error(`Invalid RoomEntity: ${message}`);
    }
  }

  // --- Serialization helpers for Redis ---
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      hostId: this.hostId,
      playerIds: this.playerIds,
      teamIds: this.teamIds,
      status: this.status,
      roomConfig: this.roomConfig,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: Record<string, any>): RoomEntity {
    const instance = plainToInstance(RoomEntity, {
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });

    instance.validate();
    return instance;
  }
}
