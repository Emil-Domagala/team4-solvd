import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/createTeam.dto';
import { JoinTeamDto, LeaveTeamDto } from './dto/joinLeave.dto';
import { TeamDto } from './dto/response/team.dto';
import { TeamMessageDto } from './dto/response/teamMessage.dto';
import { SendTeamMessageDto } from './dto/sendMessage.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active teams' })
  @ApiResponse({ status: 200, type: TeamDto, isArray: true })
  async all(): Promise<TeamDto[]> {
    return this.teamService.getAll();
  }

  @Post('create')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, type: TeamDto })
  async create(@Body() dto: CreateTeamDto): Promise<TeamDto> {
    return this.teamService.createTeam(dto.name, dto.hostId);
  }

  @Post('join')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Join a team' })
  @ApiResponse({ status: 200, type: TeamDto })
  async join(@Body() dto: JoinTeamDto): Promise<TeamDto> {
    return this.teamService.join(dto.teamId, dto.userId);
  }

  @Post('leave')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Leave a team' })
  @ApiResponse({
    status: 200,
    type: TeamDto,
    description: 'Returns team or null when deleted',
  })
  async leave(@Body() dto: LeaveTeamDto): Promise<TeamDto | null> {
    return this.teamService.leave(dto.teamId, dto.userId);
  }

  @Post('message')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Send a chat message to team' })
  @ApiResponse({ status: 201, type: TeamMessageDto })
  async message(@Body() dto: SendTeamMessageDto): Promise<TeamMessageDto> {
    return this.teamService.sendMessage(dto.teamId, dto.authorId, dto.text);
  }

  @Get(':teamId/history')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get last N messages for a team' })
  @ApiResponse({ status: 200, type: TeamMessageDto, isArray: true })
  async history(
    @Param('teamId') teamId: string,
    @Query('limit') limit = 50,
  ): Promise<TeamMessageDto[]> {
    return this.teamService.history(teamId, Math.max(1, Math.min(+limit, 200)));
  }
}
