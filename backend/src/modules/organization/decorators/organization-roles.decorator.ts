import { SetMetadata } from '@nestjs/common';
import { OrganizationRoleDomain } from '../domain/enums/organization-role.enum';

export const ORGANIZATION_ROLES_KEY = 'organization_roles';

export const OrganizationRoles = (...roles: OrganizationRoleDomain[]) =>
  SetMetadata(ORGANIZATION_ROLES_KEY, roles);

