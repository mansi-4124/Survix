import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { AuthService } from './auth.service';

import { PrismaUserRepository } from './services/prisma-user.repository';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { SessionService } from './services/session.service';

import { AUTH_TOKENS } from './auth.tokens';
import { PrismaSessionStore } from './services/prisma-session-store';
import { PrismaModule } from 'prisma/prisma.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { PasswordResetService } from './services/password-reset.service';
import { EmailService } from './services/email.service';
import { GoogleTokenService } from './services/google-token.service';
import { EmailModule } from 'src/common/email/email.module';
import { MediaModule } from '../media/media.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { VerifiedJwtAuthGuard } from './guards/verified-jwt-auth.guard';
import { UserProfileService } from './services/user-profile.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    PrismaModule,
    RedisModule,
    EmailModule,
    forwardRef(() => MediaModule),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    JwtStrategy,
    SessionService,
    UserProfileService,

    OtpService,
    PasswordResetService,
    GoogleTokenService,
    {
      provide: AUTH_TOKENS.PASSWORD_RESET_SERVICE,
      useClass: PasswordResetService,
    },
    {
      provide: AUTH_TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: AUTH_TOKENS.HASHING_SERVICE,
      useClass: HashingService,
    },
    {
      provide: AUTH_TOKENS.TOKEN_SERVICE,
      useClass: TokenService,
    },
    {
      provide: AUTH_TOKENS.OTP_SERVICE,
      useClass: OtpService,
    },
    {
      provide: AUTH_TOKENS.SESSION_STORE,
      useClass: PrismaSessionStore,
    },
    {
      provide: AUTH_TOKENS.EMAIL_SERVICE,
      useClass: EmailService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    EmailVerifiedGuard,
    VerifiedJwtAuthGuard,
  ],
  exports: [AuthService, OptionalJwtAuthGuard, EmailVerifiedGuard, VerifiedJwtAuthGuard],
})
export class AuthModule {}
