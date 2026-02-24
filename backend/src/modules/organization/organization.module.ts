import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { EmailModule } from 'src/common/email/email.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './services/organization.service';
import { PrismaOrganizationRepository } from './services/prisma-organization.repository';
import { ORGANIZATION_TOKENS } from './organization.tokens';
import { OrganizationMemberGuard } from './guards/organization-member.guard';
import { OrganizationRoleGuard } from './guards/organization-role.guard';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, RedisModule, EmailModule, AuthModule],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    PrismaOrganizationRepository,
    {
      provide: ORGANIZATION_TOKENS.ORGANIZATION_REPOSITORY,
      useExisting: PrismaOrganizationRepository,
    },
    {
      provide: ORGANIZATION_TOKENS.ORGANIZATION_MEMBER_REPOSITORY,
      useExisting: PrismaOrganizationRepository,
    },
    OrganizationMemberGuard,
    OrganizationRoleGuard,
    AuditInterceptor,
  ],
  exports: [OrganizationService, OrganizationMemberGuard, OrganizationRoleGuard],
})
export class OrganizationModule {}
