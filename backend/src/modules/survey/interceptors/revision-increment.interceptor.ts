import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RevisionIncrementInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const surveyId = request.survey?.id as string | undefined;
    const method = String(request.method ?? '').toUpperCase();
    const shouldIncrement = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (!surveyId || !shouldIncrement) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap((data) =>
        from(
          this.prisma.survey
            .update({
              where: { id: surveyId },
              data: {
                revision: { increment: 1 },
              },
            })
            .then(() => data),
        ),
      ),
    );
  }
}
