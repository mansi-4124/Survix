import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from '../../../common/redis/redis.module';
import { AUTH_TOKENS } from '../auth.tokens';
import type { IHashingService } from '../domain/interfaces/hashing-service.interface';
@Injectable()
export class OtpService {
  private readonly ttlSeconds = 60 * 5;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    @Inject(AUTH_TOKENS.HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  private getOtpKey(email: string): string {
    const hashedEmail = createHash('sha256').update(email).digest('hex');
    return `auth:otp:${hashedEmail}`;
  }

  async generateOtp(email: string): Promise<string> {
    const otp = randomInt(100000, 999999).toString();
    const hashed = await this.hashingService.hash(otp);

    await this.redis.set(`${this.getOtpKey(email)}`, hashed, {
      ex: this.ttlSeconds,
    });

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const stored = await this.redis.get<string>(`${this.getOtpKey(email)}`);
    if (!stored) return false;

    const isValid = await this.hashingService.compare(otp, stored);
    if (!isValid) return false;

    await this.redis.del(`${this.getOtpKey(email)}`);
    return true;
  }
}
