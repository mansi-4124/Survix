import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { REDIS_CLIENT } from '../redis/redis.module';

type RateLimitOptions = {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
};

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly options: RateLimitOptions = {
    windowSeconds: 60,
    maxRequests: 10,
    keyPrefix: 'rate',
  };

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const routeKey = `${req.baseUrl}${req.path}`;
    const key = `${this.options.keyPrefix}:${routeKey}:${ip}`;

    const ttl = this.options.windowSeconds;

    let current: number;
    try {
      current = await this.redis.incr(key);
    } catch {
      // If Redis is unavailable, skip rate limiting to avoid blocking auth flows.
      next();
      return;
    }

    if (current === 1) {
      await this.redis.expire(key, ttl);
    }

    res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(this.options.maxRequests - current, 0).toString(),
    );

    if (current > this.options.maxRequests) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }
}
