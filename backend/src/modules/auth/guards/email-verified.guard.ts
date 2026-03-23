import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import type { TokenPayload } from '../domain/types/token-payload.type';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload | undefined;

    if (!user?.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // `JwtStrategy.validate()` returns a lightweight token payload. We must load the
    // authoritative account state (status/emailVerified) from the database.
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { status: true, emailVerified: true },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not authenticated');
    }

    if (dbUser.status !== UserStatus.ACTIVE || dbUser.emailVerified !== true) {
      throw new ForbiddenException('Email not verified');
    }

    return true;
  }
}
