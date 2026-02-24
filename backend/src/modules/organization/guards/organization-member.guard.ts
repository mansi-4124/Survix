import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationService } from '../services/organization.service';

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: string } | undefined;

    if (!user?.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    const orgId = request.params.orgId as string | undefined;
    if (!orgId) {
      // Some routes (like accept-invite) may not have orgId
      return true;
    }

    const membership = await this.organizationService.getMembershipForUser(
      orgId,
      user.sub,
    );

    if (!membership) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    request.organizationMembership = membership;

    return true;
  }
}
