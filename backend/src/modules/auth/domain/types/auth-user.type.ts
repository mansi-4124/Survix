import { AccountStatus } from '../enums/account-status.enum';

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  BOTH = 'BOTH',
}

export type AuthUser = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  avatar?: string | null;

  passwordHash?: string | null;

  status: AccountStatus;
  provider: AuthProvider;

  emailVerified?: boolean | null;

  failedLoginAttempts: number;
  lockUntil?: Date | null;

  createdAt: Date;
  updatedAt: Date;
};
