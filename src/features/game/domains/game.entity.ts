import * as crypto from 'node:crypto';
import {
  validateSync,
  IsUUID,
  IsArray,
  IsInt,
  Min,
  IsEnum,
  IsDate,
} from 'class-validator';
import type { GameStatus } from './game.status';

export class GameEntity {
  @IsUUID() readonly id: string;
  @IsUUID() readonly roomId: string;

  @IsArray() readonly players: string[];
  @IsArray() readonly teams: string[];
  @IsEnum(['idle', 'playing', 'paused', 'ended']) status: GameStatus = 'idle';

  @IsInt() @Min(1) rounds: number;
  @IsInt() @Min(10) turnDurationInSec: number;
  @IsInt() @Min(1) wordsPerRound: number;

  @IsInt() currentRound = 0;
  @IsInt() currentTurn = 0;

  @IsUUID() currentTeamId!: string;
  @IsUUID() currentPlayerId!: string;

  @IsArray() usedWordIds: string[] = [];
  scores: Record<string, number> = {};

  @IsDate() createdAt: Date;
  @IsDate() updatedAt: Date;

  constructor(params: {
    roomId: string;
    players: readonly string[];
    teams: readonly string[];
    rounds: number;
    turnDurationInSec: number;
    wordsPerRound: number;
  }) {
    this.id = crypto.randomUUID();
    this.roomId = params.roomId;
    this.players = [...params.players];
    this.teams = [...params.teams];
    this.rounds = params.rounds;
    this.turnDurationInSec = params.turnDurationInSec;
    this.wordsPerRound = params.wordsPerRound;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  start(teamId: string, playerId: string) {
    this.status = 'playing';
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
    if (this.currentRound > this.rounds) this.status = 'ended';
    this.touch();
  }

  end() {
    this.status = 'ended';
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
      players: this.players,
      teams: this.teams,
      status: this.status,
      rounds: this.rounds,
      turnDurationInSec: this.turnDurationInSec,
      wordsPerRound: this.wordsPerRound,
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
      players: Array.isArray(json.players) ? (json.players as string[]) : [],
      teams: Array.isArray(json.teams) ? (json.teams as string[]) : [],
      rounds: Number(json.rounds),
      turnDurationInSec: Number(json.turnDurationInSec),
      wordsPerRound: Number(json.wordsPerRound),
    });

    if (typeof json.createdAt === 'string')
      g.createdAt = new Date(json.createdAt);
    if (typeof json.updatedAt === 'string')
      g.updatedAt = new Date(json.updatedAt);
    if (typeof json.status === 'string') g.status = json.status as GameStatus;

    return g;
  }
}
