import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORGANIZATION_ROLES_KEY } from '../decorators/organization-roles.decorator';
import { OrganizationRoleDomain } from '../domain/enums/organization-role.enum';
import { OrganizationMemberDomain } from '../domain/types/organization-member.type';

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<OrganizationRoleDomain[]>(
        ORGANIZATION_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership = request.organizationMembership as
      | OrganizationMemberDomain
      | undefined;

    if (!membership) {
      throw new ForbiddenException('Membership context not found');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient organization role');
    }

    return true;
  }
}

