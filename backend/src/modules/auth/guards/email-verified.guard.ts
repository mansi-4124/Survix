import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthUser } from '../domain/types/auth-user.type';
import { AccountStatus } from '../domain/enums/account-status.enum';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.status !== AccountStatus.ACTIVE || !user.emailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    return true;
  }
}

