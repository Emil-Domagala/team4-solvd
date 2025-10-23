import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScoreResponseDto } from './dto/response/scoreResponse.dto';
import { ScoreService } from './score.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from '../user/role/role.enum';
import { UpdateScoreDto } from './dto/updateScore.dto';

@ApiTags('score')
@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a score by user id' })
  @ApiResponse({
    status: 200,
    type: ScoreResponseDto,
    description: 'Returns the score with the specified user id',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ScoreResponseDto> {
    const score = await this.scoreService.findOneByUserId(id);
    return new ScoreResponseDto(score);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update score by user id' })
  @ApiResponse({
    status: 200,
    type: ScoreResponseDto,
    description: 'Score successfully updated'
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScoreDto,
  ): Promise<ScoreResponseDto> {
    const updated = await this.scoreService.updateOneByUserId(id, dto);
    return new ScoreResponseDto(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a score by user id' })
  @ApiResponse({
    status: 200,
    type: ScoreResponseDto,
    description: 'Score successfully deleted'
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ScoreResponseDto | null> {
    const removed = await this.scoreService.removeOneByUserId(id);
    return removed ? new ScoreResponseDto(removed) : null;
  }
}
