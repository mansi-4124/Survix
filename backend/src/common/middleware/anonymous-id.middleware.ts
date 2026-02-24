import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const COOKIE_NAME = 'anonymousId';

@Injectable()
export class AnonymousIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingCookie = req.cookies?.[COOKIE_NAME] as string | undefined;

    if (existingCookie) {
      req.anonymousId = existingCookie;
      next();
      return;
    }

    const generatedId = randomUUID();

    res.cookie(COOKIE_NAME, generatedId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    req.anonymousId = generatedId;
    next();
  }
}
