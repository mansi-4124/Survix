import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return data;
        }

        if (response.headersSent) {
          return data;
        }

        if (typeof data !== 'object' || data instanceof Buffer) {
          return data;
        }

        return {
          data,
          path: request.url,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

