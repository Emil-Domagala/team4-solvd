import { Body, Controller, Post, Res, Req, HttpCode } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthSessionManagerService } from '../../common/session/authSessionManager.service';
import { AuthCookieService } from '../../common/session/authCookie.service';
import { Env } from 'src/common/utils/env.util';
import { UserLoginError } from './error/userLogin.error';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { LoginUserDto } from '../user/dto/loginUser.dto';
import { UserResponseDto } from '../user/dto/response/userResponse.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionManager: AuthSessionManagerService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    type: UserResponseDto,
    description: 'User successfully registered.',
  })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(dto);

    const sessionId = await this.sessionManager.createSession(user);

    this.authCookieService.setAuthSessionCookie(res, sessionId);

    return new UserResponseDto(user);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'User successfully logged in.',
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UserLoginError();

    const sessionId = await this.sessionManager.createSession(user);

    this.authCookieService.setAuthSessionCookie(res, sessionId);

    return new UserResponseDto(user);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout the current user' })
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const sessionId = req.cookies[Env.getString('AUTH_SESSION_COOKIE_NAME')] as
      | string
      | undefined;

    if (sessionId) {
      await this.sessionManager.deleteSession(sessionId);
    }

    this.authCookieService.clearAuthSessionCookie(res);
    return { success: true };
  }
}
