import type { IEmailService } from './domain/interfaces/email-service.interface';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { IUserRepository } from './domain/interfaces/user-repository.interface';
import { type IHashingService } from './domain/interfaces/hashing-service.interface';
import { type ITokenService } from './domain/interfaces/token-service.interface';
import type { IPasswordResetService } from './domain/interfaces/password-reset-service.interface';

import { AccountStatus } from './domain/enums/account-status.enum';
import { AuthResult } from './domain/types/auth-result.type';
import { AuthUser } from './domain/types/auth-user.type';
import { TokenType } from './domain/enums/token-type.enum';
import type { IOtpService } from './domain/interfaces/otp-service.interface';
import { SessionService } from './services/session.service';
import { AUTH_TOKENS } from './auth.tokens';
import { GoogleTokenService } from './services/google-token.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    private readonly sessionService: SessionService,

    @Inject(AUTH_TOKENS.HASHING_SERVICE)
    private readonly hashingService: IHashingService,

    @Inject(AUTH_TOKENS.TOKEN_SERVICE)
    private readonly tokenService: ITokenService,

    @Inject(AUTH_TOKENS.OTP_SERVICE)
    private readonly otpService: IOtpService,

    @Inject(AUTH_TOKENS.EMAIL_SERVICE)
    private readonly emailService: IEmailService,

    @Inject(AUTH_TOKENS.PASSWORD_RESET_SERVICE)
    private readonly passwordResetService: IPasswordResetService,

    private readonly googleTokenService: GoogleTokenService,
  ) {}

  /*
  =====================================================
  SIGNUP
  - Create PENDING user
  - Hash password
  - Store user
  - Generate OTP (Redis)
  =====================================================
  */
  async signup(
    email: string,
    password: string,
    username?: string,
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(normalizedEmail);

    if (existing && existing.status === AccountStatus.ACTIVE) {
      // Avoid account enumeration
      return;
    }

    if (existing) {
      const otp = await this.otpService.generateOtp(normalizedEmail);
      await this.emailService.sendOtp(normalizedEmail, otp);
      return;
    }

    const passwordHash = await this.hashingService.hash(password);

    try {
      await this.userRepository.create({
        email: normalizedEmail,
        username,
        passwordHash,
        status: AccountStatus.PENDING_VERIFICATION,
        emailVerified: false,
        failedLoginAttempts: 0,
        lockUntil: null,
      });
    } catch {
      const persistedUser =
        await this.userRepository.findByEmail(normalizedEmail);
      if (persistedUser && persistedUser.status !== AccountStatus.ACTIVE) {
        const otp = await this.otpService.generateOtp(normalizedEmail);
        await this.emailService.sendOtp(normalizedEmail, otp);
        return;
      }
      throw new ConflictException('Unable to create account');
    }

    const otp = await this.otpService.generateOtp(normalizedEmail);
    await this.emailService.sendOtp(normalizedEmail, otp);
  }

  /*
  =====================================================
  VERIFY EMAIL
  - Validate OTP from Redis
  - Activate user
  - Create session
  =====================================================
  */
  async verifyEmail(
    email: string,
    otp: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) throw new BadRequestException('User not found');

    if (user.status === AccountStatus.ACTIVE && user.emailVerified) {
      return this.createSessionAndTokens(user, metadata);
    }

    const valid = await this.otpService.verifyOtp(normalizedEmail, otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP');

    const updatedUser = await this.userRepository.update(user.id, {
      status: AccountStatus.ACTIVE,
      emailVerified: true,
    });

    return this.createSessionAndTokens(updatedUser, metadata);
  }

  /*
  =====================================================
  LOGIN
  - Validate credentials
  - Lock logic
  - Create session
  =====================================================
  */
  async login(
    email: string,
    password: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) throw new ForbiddenException('Invalid credentials');

    if (this.isAccountLocked(user)) {
      throw new ForbiddenException('Account temporarily locked');
    }

    const match = await this.hashingService.compare(
      password,
      user.passwordHash!,
    );

    if (!match) {
      await this.handleFailedLogin(user);
      throw new ForbiddenException('Invalid credentials');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Account not active');
    }

    await this.resetFailedAttempts(user);

    return this.createSessionAndTokens(user, metadata);
  }

  /*
  =====================================================
  REFRESH TOKEN (ROTATION + REUSE DETECTION)
  =====================================================
  */
  async refresh(
    refreshToken: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResult> {
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing');
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (payload.type !== TokenType.REFRESH) {
      throw new ForbiddenException('Invalid token type');
    }

    const session = await this.sessionService.validateSession(
      payload.sessionId,
      refreshToken,
    );

    if (!session) {
      // token reuse attack detected
      await this.sessionService.invalidateAllUserSessions(payload.sub);
      throw new ForbiddenException('Invalid refresh session');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('User not active');
    }

    const tokens = await this.tokenService.generateTokens(
      user,
      payload.sessionId,
    );

    await this.sessionService.rotateSession(
      payload.sessionId,
      tokens.refreshToken,
      tokens.refreshTokenExpiresIn,
      metadata,
    );

    return { user, tokens };
  }

  /*
  =====================================================
  LOGOUT
  =====================================================
  */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (payload.type !== TokenType.REFRESH) {
      throw new ForbiddenException('Invalid token type');
    }
    await this.sessionService.invalidateSession(payload.sessionId);
  }

  /*
  =====================================================
  FORGOT PASSWORD (Redis)
  =====================================================
  */
  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) return; // prevent enumeration

    const rawToken = randomUUID();
    await this.passwordResetService.storeResetToken(user.id, rawToken);
    await this.emailService.sendPasswordReset(normalizedEmail, user.id, rawToken);
  }

  /*
  =====================================================
  RESET PASSWORD
  =====================================================
  */
  async resetPassword(
    userId: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const valid = await this.passwordResetService.verifyResetToken(
      userId,
      token,
    );

    if (!valid) throw new ForbiddenException('Invalid token');

    const passwordHash = await this.hashingService.hash(newPassword);

    await this.userRepository.updatePassword(userId, passwordHash);

    await this.sessionService.invalidateAllUserSessions(userId);

    await this.passwordResetService.clearResetToken(userId);
  }

  /*
  =====================================================
  GOOGLE LOGIN / SIGNUP VIA ID TOKEN
  =====================================================
  */
  async googleLoginOrSignup(
    googleToken: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResult> {
    const googleProfile =
      await this.googleTokenService.verifyIdToken(googleToken);

    const normalizedEmail = googleProfile.email.toLowerCase().trim();
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      user = await this.userRepository.createGoogleUser({
        email: normalizedEmail,
        name: googleProfile.name,
        avatar: googleProfile.picture,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
        failedLoginAttempts: 0,
        lockUntil: null,
      });
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Account not active');
    }

    return this.createSessionAndTokens(user, metadata);
  }

  /*
  =====================================================
  PRIVATE HELPERS
  =====================================================
  */

  private async createSessionAndTokens(
    user: AuthUser,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResult> {
    const sessionId = randomUUID();

    const tokens = await this.tokenService.generateTokens(user, sessionId);

    const storedSessionId = await this.sessionService.createSession(
      user.id,
      sessionId,
      tokens.refreshToken,
      tokens.refreshTokenExpiresIn,
      metadata,
    );

    if (storedSessionId !== sessionId) {
      // In case store overrides or normalizes the session id, regenerate tokens with the stored id
      const regeneratedTokens = await this.tokenService.generateTokens(
        user,
        storedSessionId,
      );
      return { user, tokens: regeneratedTokens };
    }

    return { user, tokens };
  }

  private isAccountLocked(user: AuthUser): boolean {
    return !!(user.lockUntil && user.lockUntil > new Date());
  }

  private async handleFailedLogin(user: AuthUser) {
    const attempts = user.failedLoginAttempts + 1;

    await this.userRepository.update(user.id, {
      failedLoginAttempts: attempts,
      lockUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
    });
  }

  private async resetFailedAttempts(user: AuthUser) {
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockUntil: null,
    });
  }
}
