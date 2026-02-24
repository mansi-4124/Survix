import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../domain/interfaces/token-service.interface';
import { AuthUser } from '../domain/types/auth-user.type';
import { AuthTokens } from '../domain/types/auth-tokens.type';
import { TokenType } from '../domain/enums/token-type.enum';
import { TokenPayload } from '../domain/types/token-payload.type';

@Injectable()
export class TokenService implements ITokenService {
  private readonly accessTokenTTL = 60 * 15; // 15 min
  private readonly refreshTokenTTL = 60 * 60 * 24 * 7; // 7 days

  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(user: AuthUser, sessionId: string): Promise<AuthTokens> {
    const accessPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: TokenType.ACCESS,
      sessionId,
    };

    const refreshPayload: TokenPayload = {
      sub: user.id,
      type: TokenType.REFRESH,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: this.accessTokenTTL,
        algorithm: 'HS256',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: this.refreshTokenTTL,
        algorithm: 'HS256',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.accessTokenTTL,
      refreshTokenExpiresIn: this.refreshTokenTTL,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: process.env.JWT_ACCESS_SECRET,
      algorithms: ['HS256'],
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: process.env.JWT_REFRESH_SECRET,
      algorithms: ['HS256'],
    });
  }
}
