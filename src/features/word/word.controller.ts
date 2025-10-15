import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { WordService, PaginationResult } from './word.service';
import { CreateWordDto } from './dto/createWord.dto';
import { UpdateWordDto } from './dto/updateWord.dto';
import { WordResponseDto } from './dto/response/wordResponse.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('word')
@Controller('words')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  @ApiOperation({ summary: 'Get all words' })
  @ApiResponse({ status: 200, type: WordResponseDto, description: 'Returns a paginated list of words' })
  async findAll(): Promise<PaginationResult<WordResponseDto>> {
    const words = await this.wordService.findAll();
    return {
      ...words,
      data: words.data.map(word => new WordResponseDto(word))
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a word by id' })
  @ApiResponse({ status: 200, type: WordResponseDto, description: 'Returns the word with the specified id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WordResponseDto> {
    const word = await this.wordService.findOne(id);
    return new WordResponseDto(word);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a word' })
  @ApiResponse({ status: 201, type: WordResponseDto, description: 'Successfully created a new word' })
  async create(@Body() dto: CreateWordDto): Promise<WordResponseDto> {
    const newWord = await this.wordService.create(dto);
    return new WordResponseDto(newWord);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update an existing word' })
  @ApiResponse({ status: 200, type: WordResponseDto, description: 'Successfully updated the word' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWordDto): Promise<WordResponseDto> {
    const updatedWord = await this.wordService.update(id, dto);
    return new WordResponseDto(updatedWord);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a word' })
  @ApiResponse({ status: 200, type: WordResponseDto, description: 'Word successfully deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<WordResponseDto | null> {
    const removedWord = await this.wordService.remove(id);
    if (removedWord) return new WordResponseDto(removedWord);
    return null;
  }
}
