import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScoreTeamService } from './scoreTeam.service';
import { ScoreTeamResponseDto } from './dto/response/scoreTeamResponse.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('team score')
@Controller('score/team')
export class ScoreTeamController {
  constructor(private readonly scoreService: ScoreTeamService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a score by team id' })
  @ApiResponse({
    status: 200,
    type: ScoreTeamResponseDto,
    description: 'Returns the score with the specified team id',
  })
  @UseGuards(AuthGuard)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ScoreTeamResponseDto> {
    const score = await this.scoreService.getScoreByTeamId(id);
    return new ScoreTeamResponseDto(score);
  }
}
