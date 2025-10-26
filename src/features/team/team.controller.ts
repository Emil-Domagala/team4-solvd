import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TeamService } from './team.service';
import { TeamChatDto } from './domains/dto/teamChat.dto';
import { TeamMessageDto } from './domains/dto/teamMessage.dto';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':teamId/chat')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get chat history for a team' })
  @ApiResponse({
    status: 200,
    description: 'Returns the last 50 chat messages of a team',
    type: TeamChatDto,
  })
  async getChatHistory(@Param('teamId') teamId: string): Promise<TeamChatDto> {
    const messages: TeamMessageDto[] =
      await this.teamService.getHistory(teamId);

    return {
      teamId,
      messages,
    };
  }
}
