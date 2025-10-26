import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScoreUserResponseDto } from './dto/response/scoreUserResponse.dto';
import { ScoreUserService } from './scoreUser.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from '../../user/role/role.enum';
import { UpdateScoreUserDto } from './dto/updateScoreUser.dto';

@ApiTags('user score')
@Controller('score/user')
export class ScoreUserController {
  constructor(private readonly scoreService: ScoreUserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a score by user id' })
  @ApiResponse({
    status: 200,
    type: ScoreUserResponseDto,
    description: 'Returns the score with the specified user id',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ScoreUserResponseDto> {
    const score = await this.scoreService.getScoreByUserId(id);
    return new ScoreUserResponseDto(score);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update score by user id' })
  @ApiResponse({
    status: 200,
    type: ScoreUserResponseDto,
    description: 'Score successfully updated'
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScoreUserDto,
  ): Promise<ScoreUserResponseDto> {
    const updated = await this.scoreService.updateScoreByUserId(id, dto);
    return new ScoreUserResponseDto(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a score by user id' })
  @ApiResponse({
    status: 200,
    type: ScoreUserResponseDto,
    description: 'Score successfully deleted'
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ScoreUserResponseDto | null> {
    const removed = await this.scoreService.removeScoreByUserId(id);
    return removed ? new ScoreUserResponseDto(removed) : null;
  }
}
