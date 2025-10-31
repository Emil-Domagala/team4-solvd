import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { GameStatus } from '../game.status';

@Exclude()
export class GameDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() roomId: string;
  @Expose() @ApiProperty() players: string[];
  @Expose() @ApiProperty() teams: string[];
  @Expose() @ApiProperty() status: GameStatus;
  @Expose() @ApiProperty() currentRound: number;
  @Expose() @ApiProperty() currentTurn: number;
  @Expose() @ApiProperty() scores: Record<string, number>;
  @Expose() @ApiProperty() createdAt: string;
  @Expose() @ApiProperty() updatedAt: string;
}
