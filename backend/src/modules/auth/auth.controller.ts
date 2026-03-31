import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/request/signup.dto.request';
import { VerifyEmailDto } from './dto/request/verify-email.dto.request';
import { LoginDto } from './dto/request/login.dto.request';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto.request';
import { ResetPasswordDto } from './dto/request/reset-password.dto.request';
import { GoogleLoginDto } from './dto/request/google-login.dto.request';
import { AuthResponseDto } from './dto/response/auth-response.dto.response';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
  =====================================================
  SIGNUP
  =====================================================
  */
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user and send OTP' })
  @ApiResponse({ status: 201, description: 'OTP sent to email' })
  async signup(@Body() dto: SignupDto) {
    await this.authService.signup(dto.email, dto.password, dto.username);
    return { message: 'If account exists, verification instructions sent' };
  }

  /*
  =====================================================
  VERIFY EMAIL
  =====================================================
  */
  @Post('verify-email')
  @Public()
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiOperation({ summary: 'Verify email with OTP' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const result = await this.authService.verifyEmail(
      dto.email,
      dto.otp,
      this.getSessionMetadata(req),
    );
    this.setRefreshCookie(res, result.tokens.refreshToken);

    return this.mapAuthResultToDto(result);
  }

  /*
  =====================================================
  LOGIN
  =====================================================
  */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const result = await this.authService.login(
      dto.email,
      dto.password,
      this.getSessionMetadata(req),
    );

    this.setRefreshCookie(res, result.tokens.refreshToken);

    return this.mapAuthResultToDto(result);
  }

  /*
  =====================================================
  REFRESH TOKEN
  =====================================================
  */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using cookie' })
  @ApiCookieAuth()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (process.env.DEBUG_REFRESH_LOG === 'true') {
      const origin = req.headers.origin;
      const referer = req.headers.referer;
      const rawCookie = req.headers.cookie ?? '';
      console.log('[auth.refresh] cookiePresent=%s cookieLen=%d origin=%s referer=%s', Boolean(refreshToken), rawCookie.length, origin, referer);
    }
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    this.ensureSameOrigin(req);

    let result: AuthResponseDto;
    let authResult: {
      user: any;
      tokens: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: number;
        refreshTokenExpiresIn: number;
      };
    };
    try {
      authResult = await this.authService.refresh(
        refreshToken,
        this.getSessionMetadata(req),
      );
      result = this.mapAuthResultToDto(authResult);
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        const isProd = process.env.NODE_ENV === 'production';
        this.clearRefreshCookie(res, isProd);
      }
      throw error;
    }

    this.setRefreshCookie(res, authResult.tokens.refreshToken);

    return result;
  }

  /*
  =====================================================
  LOGOUT
  =====================================================
  */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    this.ensureSameOrigin(req);

    await this.authService.logout(refreshToken);

    const isProd = process.env.NODE_ENV === 'production';
    this.clearRefreshCookie(res, isProd);

    return { message: 'Logged out successfully' };
  }

  /*
  =====================================================
  FORGOT PASSWORD
  =====================================================
  */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset token' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If account exists, reset instructions sent' };
  }

  /*
  =====================================================
  RESET PASSWORD
  =====================================================
  */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(
      dto.userId,
      dto.token,
      dto.newPassword,
    );

    return { message: 'Password reset successful' };
  }

  /*
  =====================================================
  GOOGLE LOGIN / SIGNUP
  =====================================================
  */
  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login or signup using Google ID token',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async googleLoginOrSignup(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const result = await this.authService.googleLoginOrSignup(
      dto.googleToken,
      this.getSessionMetadata(req),
    );

    this.setRefreshCookie(res, result.tokens.refreshToken);

    return this.mapAuthResultToDto(result);
  }

  /*
  =====================================================
  PRIVATE COOKIE HELPER
  =====================================================
  */
  private setRefreshCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    // Clear legacy path cookie to avoid stale token conflicts.
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      path: '/',
    });
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  private clearRefreshCookie(res: Response, isProd: boolean) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      path: '/',
    });
  }

  private getSessionMetadata(req: Request): {
    userAgent?: string;
    ipAddress?: string;
  } {
    const ctx = (req as any).context as
      | { userAgent?: string; ip?: string }
      | undefined;
    return {
      userAgent: ctx?.userAgent ?? req.get('user-agent') ?? undefined,
      ipAddress: ctx?.ip ?? req.ip,
    };
  }

  private ensureSameOrigin(req: Request) {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) return;

    let expectedOrigin: string;
    try {
      expectedOrigin = new URL(frontendUrl).origin;
    } catch {
      return;
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const source = origin ?? referer;
    if (!source) return;

    let sourceOrigin: string;
    try {
      sourceOrigin = new URL(source).origin;
    } catch {
      throw new ForbiddenException('Invalid origin');
    }

    if (sourceOrigin !== expectedOrigin) {
      throw new ForbiddenException('Invalid origin');
    }
  }

  private mapAuthResultToDto(result: {
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresIn: number;
      refreshTokenExpiresIn: number;
    };
  }): AuthResponseDto {
    const exposeRefreshTokenInBody =
      process.env.EXPOSE_REFRESH_TOKEN_IN_BODY === 'true';

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        name: result.user.name,
        avatar: result.user.avatar,
      },
      tokens: {
        accessToken: result.tokens.accessToken,
        ...(exposeRefreshTokenInBody
          ? { refreshToken: result.tokens.refreshToken }
          : {}),
        accessTokenExpiresIn: result.tokens.accessTokenExpiresIn,
        refreshTokenExpiresIn: result.tokens.refreshTokenExpiresIn,
      },
    };
  }
}
