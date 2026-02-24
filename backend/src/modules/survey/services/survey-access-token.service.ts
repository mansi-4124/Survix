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

  async createToken(surveyId: string, userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000).toISOString();

    const payload: SurveyAccessTokenPayload = {
      surveyId,
      userId,
      expiresAt,
    };

    await this.redis.set(this.getKey(token), JSON.stringify(payload), {
      ex: this.ttlSeconds,
    });

    return token;
  }

  async validateToken(
    token: string,
  ): Promise<SurveyAccessTokenPayload | null> {
    return this.redis.get<SurveyAccessTokenPayload>(this.getKey(token));
  }

  private getKey(token: string): string {
    return `survey:access:${token}`;
  }
}
