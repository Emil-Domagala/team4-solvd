import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SessionManagerService } from './session/sessionManager.service';
import { AuthCookieService } from './session/authCookie.service';
import { Env } from 'src/common/utils/env.util';
import { UserLoginError } from './error/userLogin.error';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/createUser.dto';
import { LoginUserDto } from '../user/dto/loginUser.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionManager: SessionManagerService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(dto);

    const sessionId = await this.sessionManager.createSession({
      userId: user.id,
      createdAt: Date.now(),
    });

    this.authCookieService.setAuthSessionCookie(res, sessionId);

    return { success: true, userId: user.id };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UserLoginError();

    const sessionId = await this.sessionManager.createSession({
      userId: user.id,
      createdAt: Date.now(),
    });

    this.authCookieService.setAuthSessionCookie(res, sessionId);

    return { userId: user.id };
  }

  @Post('logout')
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
