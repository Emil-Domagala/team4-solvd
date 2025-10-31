import * as crypto from 'node:crypto';
import {
  validateSync,
  IsUUID,
  IsArray,
  IsInt,
  Min,
  IsEnum,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GameStatus } from './game.status';
import { RoomConfig } from '../../room/domains/roomConfig.dto';

export class GameEntity {
  @IsUUID()
  readonly id: string;

  @IsUUID()
  readonly roomId: string;

  @IsArray()
  readonly teams: string[];

  @IsEnum(GameStatus)
  status: GameStatus = GameStatus.IDLE;

  @ValidateNested()
  @Type(() => RoomConfig)
  config: RoomConfig;

  @IsInt()
  @Min(0)
  currentRound = 0;

  @IsInt()
  @Min(0)
  currentTurn = 0;

  @IsUUID()
  currentTeamId!: string;

  @IsUUID()
  currentPlayerId!: string;

  @IsArray()
  usedWordIds: string[] = [];

  scores: Record<string, number> = {};

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  constructor(params: {
    roomId: string;
    teams: readonly string[];
    config: RoomConfig;
  }) {
    this.id = crypto.randomUUID();
    this.roomId = params.roomId;
    this.teams = [...params.teams];
    this.config = params.config;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  start(teamId: string, playerId: string) {
    this.status = GameStatus.PLAYING;
    this.currentRound = 1;
    this.currentTurn = 1;
    this.currentTeamId = teamId;
    this.currentPlayerId = playerId;
    this.touch();
  }

  addScore(teamId: string, pts: number) {
    this.scores[teamId] = (this.scores[teamId] ?? 0) + pts;
    this.touch();
  }

  nextRound() {
    this.currentRound++;
    if (this.currentRound > this.config.rounds) {
      this.status = GameStatus.ENDED;
    }
    this.touch();
  }

  end() {
    this.status = GameStatus.ENDED;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }

  private validate() {
    const e = validateSync(this, { whitelist: true });
    if (e.length) throw new Error(JSON.stringify(e));
  }

  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      teams: this.teams,
      status: this.status,
      config: this.config,
      currentRound: this.currentRound,
      currentTurn: this.currentTurn,
      currentTeamId: this.currentTeamId,
      currentPlayerId: this.currentPlayerId,
      usedWordIds: this.usedWordIds,
      scores: this.scores,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: Record<string, unknown>): GameEntity {
    const g = new GameEntity({
      roomId: String(json.roomId),
      teams: Array.isArray(json.teams) ? (json.teams as string[]) : [],
      config: json.config as RoomConfig,
    });

    if (typeof json.createdAt === 'string')
      g.createdAt = new Date(json.createdAt);
    if (typeof json.updatedAt === 'string')
      g.updatedAt = new Date(json.updatedAt);
    if (typeof json.status === 'string') g.status = json.status as GameStatus;

    return g;
  }
}
