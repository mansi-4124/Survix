import { AuthUser } from '../types/auth-user.type';
import { AccountStatus } from '../enums/account-status.enum';

export interface CreateUserInput {
  email: string;
  username?: string;
  passwordHash?: string;
  status: AccountStatus;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  name?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  username?: string;
  passwordHash?: string;
  status?: AccountStatus;
  emailVerified?: boolean;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  name?: string;
  avatar?: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;

  create(data: CreateUserInput): Promise<AuthUser>;

  createGoogleUser(data: CreateUserInput): Promise<AuthUser>;

  update(id: string, data: UpdateUserInput): Promise<AuthUser>;

  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
