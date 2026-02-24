import { AuthUser } from '../types/auth-user.type';
import { AuthTokens } from '../types/auth-tokens.type';
import { TokenPayload } from '../types/token-payload.type';

export interface ITokenService {
  generateTokens(user: AuthUser, sessionId: string): Promise<AuthTokens>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}
