import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Body, UseGuards } from '@nestjs/common';
import { WordUserService } from './wordUser.service';
import { WordResponseDto } from '../dto/response/wordResponse.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RolePriority } from 'src/features/user/role/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('word-user')
@Controller('words')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RolePriority.USER)
export class WordUserController {
  constructor(private readonly wordUserService: WordUserService) {}

  @Get('random')
  @ApiOperation({ summary: 'Get a random word' })
  @ApiResponse({ status: 200, type: WordResponseDto })
  @ApiResponse({ status: 404, description: 'No words found' })
  async getRandomWord(): Promise<WordResponseDto> {
    const word = await this.wordUserService.getRandomWord();
    return new WordResponseDto(word);
  }

  @Get('random-excluding')
  @ApiOperation({ summary: 'Get a random word excluding used ones' })
  @ApiResponse({ status: 200, type: WordResponseDto })
  @ApiResponse({ status: 404, description: 'No available words found' })
  async getRandomWordExcluding(
    @Body('usedWordIds') usedWordIds: string[],
  ): Promise<WordResponseDto> {
    const word = await this.wordUserService.getRandomWordExcluding(
      usedWordIds || [],
    );
    return new WordResponseDto(word);
  }

  @Get('get-similarity')
  @ApiOperation({ summary: 'Get a similarity measure between two words' })
  @ApiResponse({ status: 200, type: Number })
  getSimilarity(
    @Body('word') word: string,
    @Body('guess') guess: string,
  ): Number {
    return this.wordUserService.getSimilarity(word, guess);
  }
}
