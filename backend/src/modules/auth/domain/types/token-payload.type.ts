import { TokenType } from '../enums/token-type.enum';

export type TokenPayload = {
  sub: string;
  type: TokenType;
  sessionId: string;
  email?: string;
  iat?: number;
  exp?: number;
};
