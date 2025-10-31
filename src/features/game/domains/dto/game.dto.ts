import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from '../game.status';
import { TeamDto } from '../../../team/dto/response/team.dto';
import { RoomConfig } from '../../../room/domains/roomConfig.dto';

@Exclude()
export class GameDto {
  @Expose()
  @ApiProperty({ description: 'Unique game identifier' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Room ID this game belongs to' })
  roomId: string;

  @Expose()
  @Type(() => TeamDto)
  @ApiProperty({
    type: [TeamDto],
    description: 'Teams participating in this game (each includes members)',
  })
  teams: TeamDto[];

  @Expose()
  @ApiProperty({
    enum: GameStatus,
    description: 'Current game status',
    example: GameStatus.PLAYING,
  })
  status: GameStatus;

  @Expose()
  @Type(() => RoomConfig)
  @ApiProperty({
    type: RoomConfig,
    description: 'Game configuration (rounds, timers, etc.)',
  })
  config: RoomConfig;

  @Expose()
  @ApiProperty({ description: 'Current round number', example: 1 })
  currentRound: number;

  @Expose()
  @ApiProperty({ description: 'Current turn number', example: 1 })
  currentTurn: number;

  @Expose()
  @ApiProperty({
    description: 'Current scores per team',
    example: { 'team-uuid': 20 },
  })
  scores: Record<string, number>;

  @Expose()
  @ApiProperty({ description: 'Creation date (ISO string)' })
  createdAt: string;

  @Expose()
  @ApiProperty({ description: 'Last update date (ISO string)' })
  updatedAt: string;
}
