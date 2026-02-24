import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const requestId = randomUUID();

    (req as any).context = {
      requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    next();
  }
}

