import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class RoomConfig {
  @ApiProperty({ description: 'Maximum number of players in the room' })
  @IsInt({ message: 'Max players must be an integer' })
  @Max(10, { message: 'Max players cannot exceed 10' })
  @Min(2, { message: 'Min players must be at least 2' })
  maxPlayers: number;

  @ApiProperty({ description: 'Minimum number of players in the room' })
  @IsInt({ message: 'Min players must be an integer' })
  @Min(2, { message: 'Min players must be at least 2' })
  @Max(10, { message: 'Max players cannot exceed 10' })
  minPlayers: number;

  @ApiProperty({ description: 'Number of rounds in the game' })
  @IsInt({ message: 'Rounds must be an integer' })
  @Max(10, { message: 'Max rounds cannot exceed 10' })
  @Min(1, { message: 'Min rounds must be at least 1' })
  rounds: number;

  @ApiProperty({ description: 'Duration of each turn in seconds' })
  @IsInt({ message: 'Turn duration must be an integer' })
  @Max(60, { message: 'Max turn duration cannot exceed 60 seconds' })
  @Min(10, { message: 'Min turn duration must be at least 10 seconds' })
  turnDurationInSec: number;

  @ApiProperty({ description: 'Number of words per round' })
  @IsInt({ message: 'Words per round must be an integer' })
  @Max(10, { message: 'Max words per round cannot exceed 10' })
  @Min(1, { message: 'Min words per round must be at least 1' })
  wordsPerRound: number;
}
