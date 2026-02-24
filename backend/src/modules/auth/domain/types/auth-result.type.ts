import { AuthUser } from './auth-user.type';
import { AuthTokens } from './auth-tokens.type';

export type AuthResult = {
  user: AuthUser;
  tokens: AuthTokens;
};
