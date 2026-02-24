import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly organizationService: OrganizationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub?: string } | undefined;
    const orgId = request.params.orgId as string | undefined;
    const method = request.method;
    const url = request.url;

    const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);

    const beforePromise =
      isMutating && orgId
        ? this.organizationService
            .getOrganizationDetailsForUser(orgId, user?.sub ?? '')
            .catch(() => null)
        : Promise.resolve(null);

    return next.handle().pipe(
      tap(async (result) => {
        const before = await beforePromise;
        const after =
          isMutating && orgId
            ? await this.organizationService
                .getOrganizationDetailsForUser(orgId, user?.sub ?? '')
                .catch(() => null)
            : null;

        this.logger.log(
          JSON.stringify({
            userId: user?.sub,
            method,
            url,
            orgId,
            before,
            after,
            result,
          }),
        );
      }),
    );
  }
}

