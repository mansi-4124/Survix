import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationService } from './services/organization.service';
import { CreateOrganizationDtoRequest } from './dto/request/create-organization.dto.request';
import { SlugValidationPipe } from 'src/common/pipes/slug-validation.pipe';
import { OrganizationSummaryDtoResponse } from './dto/response/organization-summary.dto.response';
import {
  OrganizationDetailsDtoResponse,
  OrganizationDtoResponse,
} from './dto/response/organization.dto.response';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { UpdateOrganizationDtoRequest } from './dto/request/update-organization.dto.request';
import { OrganizationMemberGuard } from './guards/organization-member.guard';
import { OrganizationRoleGuard } from './guards/organization-role.guard';
import { OrganizationRoles } from './decorators/organization-roles.decorator';
import { OrganizationRoleDomain } from './domain/enums/organization-role.enum';
import { InviteMemberDtoRequest } from './dto/request/invite-member.dto.request';
import { AcceptInviteDtoRequest } from './dto/request/accept-invite.dto.request';
import { TransferOwnershipDtoRequest } from './dto/request/transfer-ownership.dto.request';
import { ChangeMemberRoleDtoRequest } from './dto/request/change-member-role.dto.request';
import { OrganizationMemberDtoResponse } from './dto/response/organization-member.dto.response';
import { OrganizationUserSearchDtoResponse } from './dto/response/organization-user-search.dto.response';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentOrganizationMembership } from './decorators/current-organization-membership.decorator';
import type { OrganizationMemberDomain } from './domain/types/organization-member.type';
import { SearchUsersDtoRequest } from './dto/request/search-users.dto.request';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';
import type { UploadedFileType } from 'src/common/types/uploaded-file.type';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /*
  =====================================================
  CREATE ORGANIZATION
  =====================================================
  */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization' })
  @ApiResponse({ status: 201, type: OrganizationSummaryDtoResponse })
  async createOrganization(
    @Body(SlugValidationPipe) dto: CreateOrganizationDtoRequest,
    // user is TokenPayload from JwtStrategy

    @CurrentUser() user: { sub: string },
  ): Promise<OrganizationSummaryDtoResponse> {
    // user id is injected via JwtAuthGuard / JwtStrategy on request.user
    // but Nest doesn't inject it by parameter, so we access via request in service layer
    // In practice, a custom decorator could be used, but to keep consistency with your codebase,
    // OrganizationService will read userId from the token where needed.
    // For now we just forward DTO and let service pick userId from request context.
    // However, to keep everything explicit and simple, we'll get userId from global request.
    const { organization, membership } =
      await this.organizationService.createOrganization(user.sub, dto);

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: membership.role,
      status: organization.status,
      accountType: organization.accountType,
      isPersonal: organization.isPersonal,
    };
  }

  @Post('personal')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create personal workspace' })
  @ApiResponse({ status: 201, type: OrganizationSummaryDtoResponse })
  async createPersonalWorkspace(
    @CurrentUser() user: { sub: string; email: string },
  ): Promise<OrganizationSummaryDtoResponse> {
    const { organization, membership } =
      await this.organizationService.createPersonalWorkspace(
        user.sub,
        user.email,
      );

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: membership.role,
      status: organization.status,
      accountType: organization.accountType,
      isPersonal: organization.isPersonal,
    };
  }

  /*
  =====================================================
  GET MY ORGANIZATIONS
  =====================================================
  */
  @Get()
  @ApiOperation({ summary: 'Get organizations for current user' })
  @ApiResponse({ status: 200, type: [OrganizationSummaryDtoResponse] })
  async getMyOrganizations(
    @CurrentUser() user: { sub: string },
  ): Promise<OrganizationSummaryDtoResponse[]> {
    const items = await this.organizationService.getMyOrganizations(user.sub);

    return items.map(({ organization, membership }) => ({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: membership.role,
      status: organization.status,
      accountType: organization.accountType,
      isPersonal: organization.isPersonal,
    }));
  }

  /*
  =====================================================
  GET ORGANIZATION DETAILS
  =====================================================
  */
  @Get(':orgId')
  @UseGuards(OrganizationMemberGuard)
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, type: OrganizationDetailsDtoResponse })
  async getOrganizationDetails(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @CurrentUser() user: { sub: string },
  ): Promise<OrganizationDetailsDtoResponse> {
    const { organization, membership } =
      await this.organizationService.getOrganizationDetailsForUser(
        orgId,
        user.sub,
      );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        ownerId: organization.ownerId,
        accountType: organization.accountType,
        isPersonal: organization.isPersonal,
        description: organization.description,
        industry: organization.industry,
        size: organization.size,
        websiteUrl: organization.websiteUrl,
        contactEmail: organization.contactEmail,
        visibility: organization.visibility,
        status: organization.status,
      },
      currentUserRole: membership.role,
      memberStatus: membership.status,
    };
  }

  /*
  =====================================================
  EDIT ORGANIZATION
  =====================================================
  */
  @Patch(':orgId')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Edit organization' })
  @ApiResponse({ status: 200, type: OrganizationDtoResponse })
  async editOrganization(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Body() dto: UpdateOrganizationDtoRequest,
  ): Promise<OrganizationDtoResponse> {
    const updated = await this.organizationService.editOrganization(orgId, dto);

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      logoUrl: updated.logoUrl,
      ownerId: updated.ownerId,
      description: updated.description,
      industry: updated.industry,
      size: updated.size,
      websiteUrl: updated.websiteUrl,
      contactEmail: updated.contactEmail,
      visibility: updated.visibility,
      status: updated.status,
      accountType: updated.accountType,
      isPersonal: updated.isPersonal,
    };
  }

  /*
  =====================================================
  UPLOAD ORGANIZATION LOGO
  =====================================================
  */
  @Post(':orgId/logo')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @UseInterceptors(FileUploadInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload organization logo' })
  @ApiResponse({ status: 200, type: OrganizationDtoResponse })
  async uploadOrganizationLogo(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @UploadedFile() file: UploadedFileType,
  ): Promise<OrganizationDtoResponse> {
    const updated = await this.organizationService.uploadOrganizationLogo(
      orgId,
      file,
    );

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      logoUrl: updated.logoUrl,
      ownerId: updated.ownerId,
      description: updated.description,
      industry: updated.industry,
      size: updated.size,
      websiteUrl: updated.websiteUrl,
      contactEmail: updated.contactEmail,
      visibility: updated.visibility,
      status: updated.status,
      accountType: updated.accountType,
      isPersonal: updated.isPersonal,
    };
  }

  /*
  =====================================================
  SOFT DELETE ORGANIZATION
  =====================================================
  */
  @Delete(':orgId')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER)
  @ApiOperation({ summary: 'Soft delete organization' })
  async softDeleteOrganization(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
  ): Promise<void> {
    await this.organizationService.softDeleteOrganization(orgId);
  }

  /*
  =====================================================
  TRANSFER OWNERSHIP
  =====================================================
  */
  @Post(':orgId/transfer-ownership')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER)
  @ApiOperation({ summary: 'Transfer organization ownership' })
  async transferOwnership(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Body() dto: TransferOwnershipDtoRequest,
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    await this.organizationService.transferOwnership(
      orgId,
      user.sub,
      dto.newOwnerUserId,
    );
  }

  /*
  =====================================================
  INVITE MEMBER
  =====================================================
  */
  @Post(':orgId/invite')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Invite member to organization' })
  async inviteMember(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Body() dto: InviteMemberDtoRequest,
    @CurrentOrganizationMembership() membership: OrganizationMemberDomain,
  ): Promise<{ message: string; expiresInDays: number }> {
    await this.organizationService.inviteMember(
      orgId,
      membership,
      dto.email,
      dto.role,
    );

    return {
      message: 'Invite sent',
      expiresInDays: 7,
    };
  }

  /*
  =====================================================
  ACCEPT INVITE
  =====================================================
  */
  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept organization invite' })
  async acceptInvite(
    @Body() dto: AcceptInviteDtoRequest,
    @CurrentUser() user: { sub: string; email: string },
  ): Promise<{ organizationId: string; role: OrganizationRoleDomain }> {
    const result = await this.organizationService.acceptInvite(
      user?.sub,
      user?.email ?? '',
      dto.token,
    );

    return result;
  }

  /*
  =====================================================
  REMOVE MEMBER
  =====================================================
  */
  @Delete(':orgId/members/:userId')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Remove member from organization' })
  async removeMember(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @CurrentOrganizationMembership() membership: OrganizationMemberDomain,
  ): Promise<void> {
    await this.organizationService.removeMember(orgId, membership, userId);
  }

  /*
  =====================================================
  LEAVE ORGANIZATION
  =====================================================
  */
  @Post(':orgId/leave')
  @UseGuards(OrganizationMemberGuard)
  @ApiOperation({ summary: 'Leave organization' })
  async leaveOrganization(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @CurrentOrganizationMembership() membership: OrganizationMemberDomain,
  ): Promise<void> {
    await this.organizationService.leaveOrganization(orgId, membership);
  }

  /*
  =====================================================
  CHANGE MEMBER ROLE
  =====================================================
  */
  @Patch(':orgId/members/:userId/role')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Change member role' })
  async changeMemberRole(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Body() dto: ChangeMemberRoleDtoRequest,
    @CurrentOrganizationMembership() membership: OrganizationMemberDomain,
  ): Promise<void> {
    await this.organizationService.changeMemberRole(
      orgId,
      membership,
      userId,
      dto.role,
    );
  }

  /*
  =====================================================
  SUSPEND MEMBER
  =====================================================
  */
  @Patch(':orgId/members/:userId/suspend')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Suspend member' })
  async suspendMember(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @CurrentOrganizationMembership() membership: OrganizationMemberDomain,
  ): Promise<void> {
    await this.organizationService.suspendMember(orgId, membership, userId);
  }

  /*
  =====================================================
  REACTIVATE MEMBER
  =====================================================
  */
  @Patch(':orgId/members/:userId/reactivate')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Reactivate member' })
  async reactivateMember(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
    @Param('userId', ParseObjectIdPipe) userId: string,
    @CurrentOrganizationMembership() membership: OrganizationMemberDomain,
  ): Promise<void> {
    await this.organizationService.reactivateMember(orgId, membership, userId);
  }

  /*
  =====================================================
  LIST MEMBERS
  =====================================================
  */
  @Get(':orgId/members')
  @UseGuards(OrganizationMemberGuard)
  @ApiOperation({ summary: 'List organization members' })
  @ApiResponse({ status: 200, type: [OrganizationMemberDtoResponse] })
  async listMembers(
    @Param('orgId', ParseObjectIdPipe) orgId: string,
  ): Promise<OrganizationMemberDtoResponse[]> {
    const members = await this.organizationService.listMembers(orgId);

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
      leftAt: m.leftAt,
      user: m.user,
    }));
  }

  @Get(':orgId/users/search')
  @UseGuards(OrganizationMemberGuard, OrganizationRoleGuard)
  @OrganizationRoles(OrganizationRoleDomain.OWNER, OrganizationRoleDomain.ADMIN)
  @ApiOperation({ summary: 'Search existing users for invitation' })
  @ApiResponse({ status: 200, type: [OrganizationUserSearchDtoResponse] })
  async searchUsers(
    @Param('orgId', ParseObjectIdPipe) _orgId: string,
    @Query() query: SearchUsersDtoRequest,
  ): Promise<OrganizationUserSearchDtoResponse[]> {
    return this.organizationService.searchUsers(query.query);
  }
}
