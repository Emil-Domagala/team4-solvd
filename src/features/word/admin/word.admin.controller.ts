import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WordAdminService } from './word.admin.service';
import { CreateWordDto } from '../dto/createWord.dto';
import { UpdateWordDto } from '../dto/updateWord.dto';
import { WordResponseDto } from '../dto/response/wordResponse.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaginationResultDto } from 'src/common/pagination/dto/paginationResult.dto';
import { WordFilterDto } from '../dto/wordFilter.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RolePriority } from 'src/features/user/role/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('word-admin')
@Controller('admin/words')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RolePriority.ADMIN)
export class WordAdminController {
  constructor(private readonly wordService: WordAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all words with filters and pagination' })
  @ApiResponse({
    status: 200,
    type: PaginationResultDto,
    description: 'Returns a paginated list of words',
  })
  async findAllByFilters(
    @Query() filters: WordFilterDto,
  ): Promise<PaginationResultDto<WordResponseDto, WordFilterDto>> {
    const result = await this.wordService.findAllByFilters(filters);

    return new PaginationResultDto(result.data, result.meta, WordResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a word by id' })
  @ApiResponse({
    status: 200,
    type: WordResponseDto,
    description: 'Returns the word with the specified id',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WordResponseDto> {
    const word = await this.wordService.findOneById(id);
    return new WordResponseDto(word);
  }

  @Post()
  @ApiOperation({ summary: 'Create a word' })
  @ApiResponse({
    status: 201,
    type: WordResponseDto,
    description: 'Successfully created a new word',
  })
  async create(@Body() dto: CreateWordDto): Promise<WordResponseDto> {
    const newWord = await this.wordService.create(dto);
    return new WordResponseDto(newWord);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing word' })
  @ApiResponse({
    status: 200,
    type: WordResponseDto,
    description: 'Successfully updated the word',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWordDto,
  ): Promise<WordResponseDto> {
    const updatedWord = await this.wordService.update(id, dto);
    return new WordResponseDto(updatedWord);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a word' })
  @ApiResponse({
    status: 200,
    type: WordResponseDto,
    description: 'Word successfully deleted',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WordResponseDto | null> {
    const removedWord = await this.wordService.remove(id);
    if (removedWord) return new WordResponseDto(removedWord);
    return null;
  }
}
