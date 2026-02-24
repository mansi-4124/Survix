import { Inject, Injectable } from '@nestjs/common';
import { IPasswordResetService } from '../domain/interfaces/password-reset-service.interface';
import { Redis } from '@upstash/redis';
import type { IHashingService } from '../domain/interfaces/hashing-service.interface';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';
import { AUTH_TOKENS } from '../auth.tokens';

@Injectable()
export class PasswordResetService implements IPasswordResetService {
  private readonly ttl = 900;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    @Inject(AUTH_TOKENS.HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async storeResetToken(userId: string, rawToken: string) {
    const hashed = await this.hashingService.hash(rawToken);
    await this.redis.set(`auth:reset:${userId}`, hashed, { ex: this.ttl });
  }

  async verifyResetToken(userId: string, token: string) {
    const stored = await this.redis.get<string>(`auth:reset:${userId}`);
    if (!stored) return false;
    return this.hashingService.compare(token, stored);
  }

  async clearResetToken(userId: string) {
    await this.redis.del(`auth:reset:${userId}`);
  }
}
