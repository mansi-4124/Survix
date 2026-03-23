import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser | null {
    void _info;
    void _context;
    void _status;
    if (err) {
      return null;
    }

    return user ?? null;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
