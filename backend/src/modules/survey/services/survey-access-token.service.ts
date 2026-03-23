import { Inject, Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { randomBytes } from 'crypto';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';

export type SurveyAccessTokenPayload = {
  surveyId: string;
  userId: string;
  expiresAt: string;
};

@Injectable()
export class SurveyAccessTokenService {
  private readonly ttlSeconds = 60 * 60 * 24 * 7;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async createToken(
    surveyId: string,
    userId: string,
    expiresAt?: Date | null,
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const now = Date.now();
    const resolvedTtlSeconds =
      expiresAt && !Number.isNaN(expiresAt.getTime())
        ? Math.max(Math.ceil((expiresAt.getTime() - now) / 1000), 1)
        : this.ttlSeconds;
    const resolvedExpiresAt = new Date(
      now + resolvedTtlSeconds * 1000,
    ).toISOString();

    const payload: SurveyAccessTokenPayload = {
      surveyId,
      userId,
      expiresAt: resolvedExpiresAt,
    };

    await this.redis.set(this.getKey(token), JSON.stringify(payload), {
      ex: resolvedTtlSeconds,
    });

    return token;
  }

  async validateToken(token: string): Promise<SurveyAccessTokenPayload | null> {
    return this.redis.get<SurveyAccessTokenPayload>(this.getKey(token));
  }

  private getKey(token: string): string {
    return `survey:access:${token}`;
  }
}
