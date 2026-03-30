import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { EmailVerifiedGuard } from './email-verified.guard';

@Injectable()
export class VerifiedJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly emailVerifiedGuard: EmailVerifiedGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtOk = await this.jwtAuthGuard.canActivate(context);
    if (!jwtOk) return false;
    return this.emailVerifiedGuard.canActivate(context);
  }
}
