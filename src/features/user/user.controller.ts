import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserResponseDto } from './dto/response/userResponse.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { AuthRequest } from 'src/common/guards/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMe(@Req() req: AuthRequest): Promise<UserResponseDto> {
    const userId = req.user!.userId;
    const user = await this.userService.me(userId);
    return new UserResponseDto(user);
  }
}
